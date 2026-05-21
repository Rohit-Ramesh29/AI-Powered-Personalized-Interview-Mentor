from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import current_user
from app.core.security import create_access_token, hash_password, verify_password
from app.db.mongo import mongo_repo
from app.schemas.api import TokenOut, UserCreate, UserLogin, UserUpdate

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenOut)
def login(payload: UserLogin):
    user = mongo_repo.get_user_by_email(payload.email)
    if not user or not verify_password(payload.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return TokenOut(access_token=create_access_token(user["email"]))


@router.get("/me")
def get_me(user: dict = Depends(current_user)):
    return {
        "id": user["_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user.get("role", "Software Engineer Intern"),
        "target_companies": user.get("target_companies", "Google, Amazon, Microsoft"),
        "language": user.get("language", "English"),
    }


@router.put("/me")
def update_me(payload: UserUpdate, user: dict = Depends(current_user)):
    updated = mongo_repo.update_user(user["email"], {
        "name": payload.name,
        "role": payload.role,
        "target_companies": payload.target_companies,
        "language": payload.language,
    })
    return {
        "id": updated["_id"],
        "email": updated["email"],
        "name": updated["name"],
        "role": updated.get("role"),
        "target_companies": updated.get("target_companies"),
        "language": updated.get("language"),
    }


@router.post("/demo", response_model=TokenOut)
def demo_login():
    user = mongo_repo.get_user_by_email("demo@mentor.local")
    if not user:
        mongo_repo.create_user(
            email="demo@mentor.local",
            name="Demo Candidate",
            hashed_password=hash_password("demo-password"),
        )
    return TokenOut(access_token=create_access_token("demo@mentor.local"))


@router.post("/register", response_model=TokenOut)
def register(payload: UserCreate):
    existing = mongo_repo.get_user_by_email(payload.email)
    if existing:
        raise HTTPException(status_code=409, detail="An account with this email already exists. Please sign in.")
    mongo_repo.create_user(
        email=payload.email,
        name=payload.name,
        hashed_password=hash_password(payload.password),
    )
    return TokenOut(access_token=create_access_token(payload.email))


@router.get("/google/url")
def google_url():
    return {
        "url": "https://accounts.google.com/o/oauth2/v2/auth",
        "note": "Configure Google OAuth client id, redirect URI, and callback exchange before production use.",
    }


@router.post("/google/callback", response_model=TokenOut)
def google_callback():
    user = mongo_repo.get_user_by_email("google-demo@mentor.local")
    if not user:
        mongo_repo.create_user(
            email="google-demo@mentor.local",
            name="Google Demo Candidate",
            hashed_password=hash_password("oauth-user"),
            google_id="demo-google-id",
        )
    return TokenOut(access_token=create_access_token("google-demo@mentor.local"))
