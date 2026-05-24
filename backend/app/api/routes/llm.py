from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.user import User
from app.schemas.llm import CompanyResearchRequest, PromptRequest
from app.services.llm_service import generate_chat_response, get_total_token_usage
from app.services.research_service import research_company

router = APIRouter(dependencies=[Depends(get_current_user)])


@router.post("/prompt")
def prompt(
    payload: PromptRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return generate_chat_response(db, current_user, payload.prompt)
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.post("/company")
def company(
    payload: CompanyResearchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        return research_company(db, current_user, payload.company)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    except RuntimeError as exc:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc)) from exc


@router.get("/token_count")
def token_count(db: Session = Depends(get_db)):
    usage = get_total_token_usage(db)
    return {"totalTokens": usage.total_tokens}
