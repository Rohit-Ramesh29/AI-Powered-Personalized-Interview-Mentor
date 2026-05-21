from datetime import UTC, datetime
from typing import Any

from bson import ObjectId
from app.core.config import get_settings


def _clean(doc: dict) -> dict:
    """Convert ObjectId to str so documents are JSON-serialisable."""
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


class MongoRepository:
    def __init__(self) -> None:
        self.settings = get_settings()
        from pymongo import MongoClient

        uri = self.settings.mongodb_uri or "mongodb://localhost:27017"
        self.client = MongoClient(uri, serverSelectionTimeoutMS=5000)
        self.db = self.client[self.settings.mongodb_db]

        # Ensure indexes
        self.db.users.create_index("email", unique=True)
        self.db.interview_sessions.create_index("session_id")
        self.db.feedback_events.create_index("user_email")
        self.db.chat_messages.create_index("session_id")

    @property
    def enabled(self) -> bool:
        return self.db is not None

    def ping(self) -> dict[str, Any]:
        self.client.admin.command("ping")
        return {"enabled": True, "database": self.settings.mongodb_db}

    # ── Users ────────────────────────────────────────────────────────────────

    def create_user(self, email: str, name: str, hashed_password: str, google_id: str | None = None) -> dict[str, Any]:
        now = datetime.now(UTC)
        doc = {
            "email": email,
            "name": name,
            "hashed_password": hashed_password,
            "google_id": google_id,
            "role": "Software Engineer Intern",
            "target_companies": "Google, Amazon, Microsoft",
            "language": "English",
            "created_at": now,
        }
        result = self.db.users.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    def get_user_by_email(self, email: str) -> dict[str, Any] | None:
        doc = self.db.users.find_one({"email": email})
        return _clean(doc) if doc else None

    def get_user_by_id(self, user_id: str) -> dict[str, Any] | None:
        doc = self.db.users.find_one({"_id": ObjectId(user_id)})
        return _clean(doc) if doc else None

    def update_user(self, email: str, updates: dict[str, Any]) -> dict[str, Any] | None:
        self.db.users.update_one({"email": email}, {"$set": {**updates, "updated_at": datetime.now(UTC)}})
        return self.get_user_by_email(email)

    # ── Resumes ──────────────────────────────────────────────────────────────

    def insert_resume(self, payload: dict[str, Any]) -> None:
        self.db.resume_profiles.insert_one({**payload, "created_at": datetime.now(UTC)})

    def get_latest_resume(self, user_email: str) -> dict[str, Any] | None:
        doc = self.db.resume_profiles.find_one(
            {"user_email": user_email},
            sort=[("created_at", -1)],
        )
        return _clean(doc) if doc else None

    # ── Interview Sessions ────────────────────────────────────────────────────

    def insert_interview_session(self, payload: dict[str, Any]) -> None:
        self.db.interview_sessions.insert_one({**payload, "created_at": datetime.now(UTC)})

    def get_interview_session(self, session_id: str) -> dict[str, Any] | None:
        doc = self.db.interview_sessions.find_one({"session_id": session_id})
        return _clean(doc) if doc else None

    def update_interview_history(self, session_id: str, history: list[dict[str, Any]]) -> None:
        self.db.interview_sessions.update_one(
            {"session_id": session_id},
            {"$set": {"history": history, "updated_at": datetime.now(UTC)}},
        )

    def count_sessions(self, user_email: str) -> int:
        return self.db.interview_sessions.count_documents({"user_email": user_email})

    # ── Chat Messages ─────────────────────────────────────────────────────────

    def insert_chat_message(self, payload: dict[str, Any]) -> None:
        self.db.chat_messages.insert_one({**payload, "created_at": datetime.now(UTC)})

    # ── Feedback Events ───────────────────────────────────────────────────────

    def insert_feedback(self, payload: dict[str, Any]) -> None:
        self.db.feedback_events.insert_one({**payload, "created_at": datetime.now(UTC)})

    def feedback_events(self, user_email: str) -> list[dict[str, Any]]:
        return [_clean(doc) for doc in self.db.feedback_events.find({"user_email": user_email}).sort("created_at", 1)]


mongo_repo = MongoRepository()
