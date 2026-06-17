from langchain_openai import ChatOpenAI, OpenAIEmbeddings

from app.core.config import get_settings

settings = get_settings()

def build_chat_model() -> ChatOpenAI:
    return ChatOpenAI(
        api_key=settings.open_ai_api_key,
        model=settings.open_ai_chat_model,
        temperature=0,
    )


def build_embeddings() -> OpenAIEmbeddings:
    return OpenAIEmbeddings(
        api_key=settings.open_ai_api_key,
        model=settings.open_ai_embedding_model,
        dimensions=settings.open_ai_embedding_dimensions,
    )
