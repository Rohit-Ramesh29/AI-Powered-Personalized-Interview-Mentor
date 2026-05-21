from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import analytics, auth, coding, database, emotion, interviews, rag, recommendations, resumes, voice
from app.core.config import get_settings
from app.rag.vector_store import seed_from_file

settings = get_settings()
app = FastAPI(title=settings.app_name, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(resumes.router, prefix="/api")
app.include_router(rag.router, prefix="/api")
app.include_router(interviews.router, prefix="/api")
app.include_router(coding.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(voice.router, prefix="/api")
app.include_router(emotion.router, prefix="/api")
app.include_router(database.router, prefix="/api")


@app.on_event("startup")
def startup() -> None:
    seed_from_file(Path("data/seed/interview_bank.md"))


@app.get("/api/health")
def health():
    return {"status": "ok", "app": settings.app_name}
