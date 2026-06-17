from jose import JWTError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, decode_access_token, hash_password, verify_password
from app.models.user import User
from app.schemas.auth import ChangePasswordRequest, LoginRequest, RegisterRequest


def _token_payload(user: User) -> dict:
    return {
        "id": str(user.id),
        "firstName": user.first_name,
        "lastName": user.last_name,
        "email": user.email,
    }


def register_user(db: Session, payload: RegisterRequest) -> dict:
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user:
        raise ValueError("User already exists")

    user = User(
        first_name=payload.firstName,
        last_name=payload.lastName,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    return {"message": "User registered", "token": create_access_token(_token_payload(user))}


def authenticate_user(db: Session, payload: LoginRequest) -> dict:
    user = db.scalar(select(User).where(User.email == payload.email))
    if not user or not verify_password(payload.password, user.password_hash):
        raise ValueError("Invalid credentials")

    return {"message": "Login successful", "token": create_access_token(_token_payload(user))}


def change_password(db: Session, payload: ChangePasswordRequest) -> dict:
    if not payload.authorization or not payload.authorization.startswith("Bearer "):
        raise PermissionError("No token provided")

    token = payload.authorization.split(" ", 1)[1]
    try:
        decoded = decode_access_token(token)
    except JWTError as exc:
        raise PermissionError("Invalid token") from exc

    user = db.get(User, int(decoded["id"]))
    if not user:
        raise ValueError("User not found")
    if not verify_password(payload.oldPassword, user.password_hash):
        raise ValueError("Incorrect current password")

    user.password_hash = hash_password(payload.newPassword)
    db.add(user)
    db.commit()
    db.refresh(user)
    return {
        "message": "Password changed successfully",
        "token": create_access_token(_token_payload(user)),
    }
