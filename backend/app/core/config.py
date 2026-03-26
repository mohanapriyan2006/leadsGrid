from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: str = "development"
    allow_anonymous_dev: bool = True
    secret_key: str = "change-me-in-production"
    access_token_expire_minutes: int = 120

    database_url: str = "sqlite:///./pitchpilot.db"
    redis_url: str = "redis://localhost:6379/0"

    cors_origins: list[str] = ["http://localhost:5173"]

    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    openrouter_api_key: str | None = None


settings = Settings()
