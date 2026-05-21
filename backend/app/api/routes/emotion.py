from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import current_user

router = APIRouter(prefix="/emotion", tags=["emotion"])


class EmotionSignalIn(BaseModel):
    eye_contact_ratio: float = 0.7
    smile_ratio: float = 0.3
    face_visible: bool = True


@router.post("/analyze")
def analyze(payload: EmotionSignalIn, _: dict = Depends(current_user)):
    confidence = int((payload.eye_contact_ratio * 70) + (payload.smile_ratio * 20) + (10 if payload.face_visible else 0))
    return {
        "confidence": confidence,
        "nervousness": max(0, 100 - confidence),
        "eye_contact": payload.eye_contact_ratio,
        "feedback": "Keep your gaze near the camera and use natural pauses during longer explanations.",
    }
