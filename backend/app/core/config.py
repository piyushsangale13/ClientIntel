from functools import lru_cache

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="ClientIntel FastAPI", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    debug: bool = Field(default=False, alias="DEBUG")
    port: int = Field(default=8000, alias="PORT")
    api_v1_prefix: str = Field(default="/api", alias="API_V1_PREFIX")
    cors_origins: list[str] = Field(default=["*"], alias="CORS_ORIGINS")

    database_url: str = Field(alias="DATABASE_URL")
    qdrant_url: str = Field(alias="QDRANT_URL")
    qdrant_collection: str = Field(default="company_research_chunks", alias="QDRANT_COLLECTION")

    jwt_secret: str = Field(alias="JWT_SECRET")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    jwt_expire_minutes: int = Field(default=60, alias="JWT_EXPIRE_MINUTES")

    open_ai_api_key: str = Field(alias="OPEN_AI_API_KEY")
    open_ai_chat_model: str = Field(default="gpt-4.1-mini", alias="OPEN_AI_CHAT_MODEL")
    open_ai_embedding_model: str = Field(default="text-embedding-3-large", alias="OPEN_AI_EMBEDDING_MODEL")
    open_ai_embedding_dimensions: int = Field(default=3072, alias="OPEN_AI_EMBEDDING_DIMENSIONS")

    google_api_key: str | None = Field(default=None, alias="GOOGLE_API_KEY")
    google_cse_id: str | None = Field(default=None, alias="GOOGLE_CSE_ID")


@lru_cache
def get_settings() -> Settings:
    return Settings()
