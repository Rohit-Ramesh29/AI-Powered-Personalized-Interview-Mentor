from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Smart Interview Preparation Mentor"
    environment: str = "local"
    secret_key: str = "change-me"
    database_url: str = "sqlite:///./mentor.db"
    mongodb_uri: str | None = None
    mongodb_db: str = "smart_interview_ai"
    openai_api_key: str | None = None
    llm_provider: str = "local"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    chroma_path: str = "./storage/chroma"
    cors_origins: str = "http://localhost:5173"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
