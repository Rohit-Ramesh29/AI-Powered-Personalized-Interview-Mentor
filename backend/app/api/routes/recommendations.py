from fastapi import APIRouter, Depends

from app.api.deps import current_user

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("/today")
def today(_: dict = Depends(current_user)):
    return {
        "daily_plan": ["30 min arrays and hashing", "1 HR story using STAR", "1 system design component deep dive"],
        "revision": ["HTTP caching", "SQL joins", "Time complexity patterns"],
        "coding_challenges": ["Two Sum", "Longest Substring Without Repeating Characters", "Merge Intervals"],
        "interview_readiness_score": 84,
    }
