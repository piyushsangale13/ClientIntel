import json
import re

from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.models.chat_message import ChatMessage
from app.models.company_research import CompanyResearch
from app.models.user import User
from app.services.langchain_factory import build_chat_model
from app.services.token_service import get_or_create_usage, record_token_usage
from app.services.vector_service import similarity_search


def _extract_company_from_prompt(prompt: str) -> str | None:
    patterns = [
        r'"company"\s*:\s*"([^"]+)"',
        r"about\s+\*\*([^*]+)\*\*",
        r"Company:\s*([^\n]+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, prompt, re.IGNORECASE)
        if match:
            return match.group(1).strip()
    return None


def _recent_history(db: Session, user: User, limit: int = 8) -> list[ChatMessage]:
    rows = db.scalars(
        select(ChatMessage)
        .where(ChatMessage.user_id == user.id)
        .order_by(desc(ChatMessage.created_at))
        .limit(limit)
    ).all()
    return list(reversed(rows))


def _find_context_company(db: Session, user: User, prompt: str) -> CompanyResearch | None:
    company_name = _extract_company_from_prompt(prompt)
    if company_name:
        company = db.scalar(
            select(CompanyResearch).where(CompanyResearch.company.ilike(company_name))
        )
        if company:
            return company

    return db.scalar(
        select(CompanyResearch)
        .where(CompanyResearch.requested_by_user_id == user.id)
        .order_by(desc(CompanyResearch.last_updated))
        .limit(1)
    )


def generate_chat_response(db: Session, user: User, prompt: str) -> str:
    chat_model = build_chat_model()
    company = _find_context_company(db, user, prompt)
    snippets = []
    if company:
        snippets = [doc.page_content for doc in similarity_search(prompt, company.id, limit=4)]

    history = _recent_history(db, user)
    system_prompt = """
You are a company research assistant.
Answer clearly and concisely.
If context is missing, say what is uncertain instead of inventing details.
"""
    messages = [{"role": "system", "content": system_prompt}]

    if company:
        messages.append(
            {
                "role": "system",
                "content": f"Active company context: {company.company}\nSummary: {company.summary}",
            }
        )

    if snippets:
        messages.append(
            {
                "role": "system",
                "content": "Relevant retrieved research context:\n" + "\n\n".join(snippets),
            }
        )

    for item in history:
        messages.append({"role": item.role, "content": item.content})

    messages.append({"role": "user", "content": prompt})
    result = chat_model.invoke(messages)
    token_count = result.response_metadata.get("token_usage", {}).get("total_tokens", 0)
    record_token_usage(db, token_count)

    content = result.content if isinstance(result.content, str) else json.dumps(result.content)
    db.add(ChatMessage(user_id=user.id, role="user", content=prompt))
    db.add(ChatMessage(user_id=user.id, role="assistant", content=content))
    db.commit()
    return content or "No reply"


def get_total_token_usage(db: Session):
    return get_or_create_usage(db)
