from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CompanyResearch(Base):
    __tablename__ = "company_research"

    id: Mapped[int] = mapped_column(primary_key=True)
    company: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    official_website: Mapped[str] = mapped_column(String(500))
    website_text: Mapped[str] = mapped_column(Text)
    summary: Mapped[str] = mapped_column(Text)
    news: Mapped[list] = mapped_column(JSONB, default=list)
    top_news: Mapped[list] = mapped_column(JSONB, default=list)
    company_domain: Mapped[str] = mapped_column(String(255), default="")
    employee_size: Mapped[str] = mapped_column(String(255), default="")
    company_locations: Mapped[list] = mapped_column(JSONB, default=list)
    top_insights: Mapped[list] = mapped_column(JSONB, default=list)
    requested_by_user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    last_updated: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, index=True)
