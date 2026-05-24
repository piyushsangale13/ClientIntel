# backend2

FastAPI replacement for the legacy Express backend.

## Stack

- FastAPI
- LangChain + OpenAI
- PostgreSQL for relational storage
- Qdrant for vector search

## Run locally

1. Update the values in `.env.example`
2. Start from the repo root:

```bash
docker compose up --build
```

The API will be available at `http://localhost:8000`.
