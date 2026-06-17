from pydantic import BaseModel, EmailStr


class RegisterRequest(BaseModel):
    firstName: str
    lastName: str
    email: EmailStr
    password: str


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    oldPassword: str
    newPassword: str
    authorization: str | None = None
