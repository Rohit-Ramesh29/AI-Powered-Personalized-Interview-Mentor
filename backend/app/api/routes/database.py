from fastapi import APIRouter, HTTPException

from app.db.mongo import mongo_repo

router = APIRouter(prefix="/database", tags=["database"])


@router.get("/status")
def status():
    try:
        mongo = mongo_repo.ping()
    except Exception as exc:
        raise HTTPException(status_code=503, detail=f"MongoDB connection failed: {exc}") from exc
    return {"mongodb": mongo}
