from fastapi import APIRouter, Depends

from app.api.deps import current_user
from app.db.mongo import mongo_repo

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/me")
def me(user: dict = Depends(current_user)):
    events = mongo_repo.feedback_events(user["email"])
    mock_rounds = mongo_repo.count_sessions(user["email"])

    if not events:
        return {
            "readiness_score": 0,
            "mock_rounds": 0,
            "coding_score": 0,
            "weak_topics": [],
            "progress": [],
            "category_scores": [],
        }

    avg = sum(e["scores"].get("technical_accuracy", 0) for e in events) // len(events)
    coding_events = [e for e in events if e.get("topic") == "Coding"]
    coding_score = (
        sum(e["scores"].get("technical_accuracy", 0) for e in coding_events) // len(coding_events)
        if coding_events
        else 0
    )

    return {
        "readiness_score": avg,
        "mock_rounds": mock_rounds,
        "coding_score": coding_score,
        "weak_topics": [
            {"name": e["topic"], "score": e["scores"].get("technical_accuracy", 0)}
            for e in events[-6:]
        ],
        "progress": [
            {"day": str(i + 1), "score": e["scores"].get("clarity", 0)}
            for i, e in enumerate(events[-7:])
        ],
        "category_scores": [
            {"name": "Technical", "value": avg},
            {
                "name": "Communication",
                "value": sum(e["scores"].get("communication", 0) for e in events) // len(events),
            },
        ],
    }
