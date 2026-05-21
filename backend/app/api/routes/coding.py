from fastapi import APIRouter, Depends

from app.api.deps import current_user
from app.db.mongo import mongo_repo
from app.schemas.api import CodeEvaluationIn, CodingQuestionOut
from app.services.coding_evaluator import evaluate_code
from app.services.coding_questions import coding_question

router = APIRouter(prefix="/coding", tags=["coding"])


@router.get("/question", response_model=CodingQuestionOut)
def get_question(index: int = 0, language: str = "python", user: dict = Depends(current_user)):
    profile = mongo_repo.get_latest_resume(user["email"])
    topics = []
    if profile and isinstance(profile.get("analysis"), dict):
        analysis = profile["analysis"]
        topics = analysis.get("topics") or analysis.get("technologies") or analysis.get("skills") or []
    return coding_question(topics, max(0, index), language)


@router.post("/evaluate")
def evaluate(payload: CodeEvaluationIn, user: dict = Depends(current_user)):
    result = evaluate_code(payload.language, payload.code, payload.problem)

    mongo_repo.insert_feedback({
        "user_id": user["_id"],
        "user_email": user["email"],
        "session_id": None,
        "topic": "Coding",
        "scores": {
            "technical_accuracy": result["correctness"],
            "communication": 100,
            "confidence": 100,
            "clarity": 100,
        },
        "suggestions": [result["optimization"]],
    })

    return result
