from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.api.deps import current_user
from app.db.mongo import mongo_repo
from app.rag.vector_store import vector_store
from app.schemas.api import ResumeAnalysisOut
from app.services.document_parser import extract_text
from app.services.resume_analyzer import analyze_resume

router = APIRouter(prefix="/resumes", tags=["resumes"])
UPLOAD_DIR = Path("storage/uploads")


@router.post("/analyze", response_model=ResumeAnalysisOut)
async def analyze(file: UploadFile = File(...), user: dict = Depends(current_user)):
    suffix = Path(file.filename or "").suffix.lower()
    if suffix not in {".pdf", ".docx", ".txt"}:
        raise HTTPException(status_code=400, detail="Only PDF, DOCX, and TXT uploads are supported")
    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    path = UPLOAD_DIR / f"{uuid4().hex}{suffix}"
    path.write_bytes(await file.read())
    text = extract_text(path)
    result = analyze_resume(text)
    chunks = vector_store.chunk(text)
    vector_store.add_texts(
        chunks,
        [{"source": file.filename, "user_id": user["_id"], "kind": "resume"} for _ in chunks],
    )
    mongo_repo.insert_resume({
        "user_id": user["_id"],
        "user_email": user["email"],
        "filename": file.filename or path.name,
        "extracted_text": text,
        "analysis": result,
    })
    return result


@router.get("/latest", response_model=ResumeAnalysisOut)
def get_latest(user: dict = Depends(current_user)):
    profile = mongo_repo.get_latest_resume(user["email"])
    if not profile:
        raise HTTPException(status_code=404, detail="No resume analyzed yet")
    return profile["analysis"]
