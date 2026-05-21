from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import current_user

router = APIRouter(prefix="/voice", tags=["voice"])


class VoiceSignalIn(BaseModel):
    transcript: str
    pause_ms: int = 0


@router.post("/analyze")
def analyze(payload: VoiceSignalIn, _: dict = Depends(current_user)):
    return {
        "transcript": payload.transcript,
        "hesitation_score": min(100, payload.pause_ms // 40),
        "feedback": "Reduce long pauses by outlining your answer before speaking." if payload.pause_ms > 1200 else "Good speaking rhythm.",
    }
