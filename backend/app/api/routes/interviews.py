from fastapi import APIRouter, Depends, HTTPException

from app.api.deps import current_user
from app.db.mongo import mongo_repo
from app.schemas.api import ChatTurn, InterviewAnswerIn, InterviewStartIn, InterviewStartOut
from app.services.interview_engine import first_question, follow_up, new_session_id

router = APIRouter(prefix="/interviews", tags=["interviews"])


@router.post("/start", response_model=InterviewStartOut)
async def start(payload: InterviewStartIn, user: dict = Depends(current_user)):
    session_id = new_session_id()
    question = await first_question(payload.mode, payload.company, payload.topics)
    history = [{"role": "interviewer", "content": question}]

    mongo_repo.insert_interview_session({
        "session_id": session_id,
        "user_id": user["_id"],
        "user_email": user["email"],
        "mode": payload.mode,
        "company": payload.company,
        "topics": payload.topics,
        "history": history,
    })
    mongo_repo.insert_chat_message({
        "session_id": session_id,
        "role": "interviewer",
        "content": question,
        "meta": {},
    })
    return InterviewStartOut(session_id=session_id, turn=ChatTurn(role="interviewer", content=question))


@router.post("/{session_id}/answer")
async def answer(session_id: str, payload: InterviewAnswerIn, user: dict = Depends(current_user)):
    session = mongo_repo.get_interview_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Interview session not found")

    history = list(session.get("history") or []) + [{"role": "candidate", "content": payload.answer}]
    question, feedback = await follow_up(session["mode"], session["company"], session.get("topics") or [], payload.answer, history)
    history.append({"role": "interviewer", "content": question, "feedback": feedback})

    mongo_repo.update_interview_history(session_id, history)
    mongo_repo.insert_chat_message({"session_id": session_id, "role": "candidate", "content": payload.answer, "meta": {}})
    mongo_repo.insert_chat_message({"session_id": session_id, "role": "interviewer", "content": question, "meta": {"feedback": feedback}})

    topics = session.get("topics") or []
    topic = topics[0] if topics else session["mode"]
    mongo_repo.insert_feedback({
        "user_id": user["_id"],
        "user_email": user["email"],
        "session_id": session_id,
        "topic": topic,
        "scores": feedback,
        "suggestions": feedback["suggestions"],
    })

    return {"next_turn": {"role": "interviewer", "content": question}, "feedback": feedback}
