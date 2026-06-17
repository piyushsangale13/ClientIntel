from langchain_core.documents import Document
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http import models as rest

from app.core.config import get_settings
from app.services.langchain_factory import build_embeddings

settings = get_settings()

_embeddings = None


def _get_embeddings():
    global _embeddings
    if _embeddings is None:
        _embeddings = build_embeddings()
    return _embeddings


def get_qdrant_client() -> QdrantClient:
    return QdrantClient(url=settings.qdrant_url)


def ensure_vector_collection() -> None:
    client = get_qdrant_client()
    collections = {item.name for item in client.get_collections().collections}
    if settings.qdrant_collection in collections:
        return

    client.create_collection(
        collection_name=settings.qdrant_collection,
        vectors_config=rest.VectorParams(
            size=settings.open_ai_embedding_dimensions,
            distance=rest.Distance.COSINE,
        ),
    )


def get_vector_store() -> QdrantVectorStore:
    return QdrantVectorStore(
        client=get_qdrant_client(),
        collection_name=settings.qdrant_collection,
        embedding=_get_embeddings(),
    )


def index_company_documents(company_id: int, company: str, documents: list[Document]) -> None:
    if not documents:
        return

    client = get_qdrant_client()
    client.delete(
        collection_name=settings.qdrant_collection,
        points_selector=rest.FilterSelector(
            filter=rest.Filter(
                must=[rest.FieldCondition(key="metadata.company_id", match=rest.MatchValue(value=company_id))]
            )
        ),
    )
    store = get_vector_store()
    for document in documents:
        document.metadata = {**document.metadata, "company_id": company_id, "company": company}
    store.add_documents(documents)


def similarity_search(query: str, company_id: int | None, limit: int = 4) -> list[Document]:
    store = get_vector_store()
    search_kwargs = {"k": limit}
    if company_id is not None:
        search_kwargs["filter"] = rest.Filter(
            must=[rest.FieldCondition(key="metadata.company_id", match=rest.MatchValue(value=company_id))]
        )
    return store.similarity_search(query, **search_kwargs)
