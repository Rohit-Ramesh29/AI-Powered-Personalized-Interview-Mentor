from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.api.deps import current_user
from app.rag.vector_store import vector_store

router = APIRouter(prefix="/rag", tags=["rag"])


class SearchIn(BaseModel):
    query: str
    k: int = 5


@router.post("/search")
def search(payload: SearchIn, _: dict = Depends(current_user)):
    return {"matches": vector_store.search(payload.query, payload.k)}
