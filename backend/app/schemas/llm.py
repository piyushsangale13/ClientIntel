from pydantic import BaseModel


class PromptRequest(BaseModel):
    prompt: str


class CompanyResearchRequest(BaseModel):
    company: str
