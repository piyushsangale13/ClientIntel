from datetime import datetime

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.token_usage import TokenUsage


def record_token_usage(db: Session, tokens: int) -> None:
    if tokens <= 0:
        return

    usage = db.scalar(select(TokenUsage).limit(1))
    if not usage:
        usage = TokenUsage(total_tokens=tokens, updated_at=datetime.utcnow())
    else:
        usage.total_tokens += tokens
        usage.updated_at = datetime.utcnow()

    db.add(usage)
    db.commit()


def get_or_create_usage(db: Session) -> TokenUsage:
    usage = db.scalar(select(TokenUsage).limit(1))
    if usage:
        return usage

    usage = TokenUsage(total_tokens=0, updated_at=datetime.utcnow())
    db.add(usage)
    db.commit()
    db.refresh(usage)
    return usage
