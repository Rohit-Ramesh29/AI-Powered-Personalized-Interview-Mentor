from fastapi import APIRouter, Depends

from app.api.deps import current_user
from app.db.mongo import mongo_repo
from app.schemas.api import CodeEvaluationIn, CodingQuestionOut, QuestionListItem
from app.services.coding_evaluator import evaluate_code
from app.services.coding_questions import coding_question, get_concept_questions_list

router = APIRouter(prefix="/coding", tags=["coding"])


@router.get("/questions", response_model=list[QuestionListItem])
def list_questions(concept: str = "", company: str = "", _user: dict = Depends(current_user)):
    return get_concept_questions_list(concept, company)


@router.get("/question", response_model=CodingQuestionOut)
def get_question(index: int = 0, language: str = "python", concept: str = "", company: str = "", user: dict = Depends(current_user)):
    profile = mongo_repo.get_latest_resume(user["email"])
    topics = []
    if profile and isinstance(profile.get("analysis"), dict):
        analysis = profile["analysis"]
        topics = analysis.get("topics") or analysis.get("technologies") or analysis.get("skills") or []
    return coding_question(topics, max(0, index), language, concept, company)


@router.post("/evaluate")
def evaluate(payload: CodeEvaluationIn, user: dict = Depends(current_user)):
    test_cases = [{"input": tc.input, "expected": tc.expected} for tc in payload.test_cases]
    result = evaluate_code(payload.language, payload.code, payload.problem, test_cases, payload.language)

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

    if (
        result["tests_passed"] == result["tests_total"] > 0
        and payload.topic
        and payload.question_index >= 0
    ):
        mongo_repo.mark_coding_complete(
            user["email"], payload.topic, payload.question_index, payload.problem
        )

    return result


@router.get("/completed")
def get_completed(user: dict = Depends(current_user)):
    return mongo_repo.get_completed_coding(user["email"])
