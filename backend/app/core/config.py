from functools import lru_cache

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PitchPilot Agent Microservice"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api"
    cors_origins: list[str] = Field(default_factory=lambda: ["http://localhost:5173"])

    request_timeout_seconds: int = 15
    source_limit_default: int = 20

    gemini_api_key: str | None = None
    openai_api_key: str | None = None
    openrouter_api_key: str | None = None

    firebase_project_id: str | None = None
    firebase_service_account_path: str | None = None
    require_auth: bool = False

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 465
    smtp_sender: str | None = None
    smtp_app_password: str | None = None
    smtp_rate_limit_per_min: int = 20

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [item.strip() for item in value.split(",") if item.strip()]
        return value


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
