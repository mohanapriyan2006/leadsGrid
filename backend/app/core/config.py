from functools import lru_cache
import json

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "PitchPilot Agent Microservice"
    environment: str = "development"
    debug: bool = False
    api_prefix: str = "/api"
    # Keep this as a plain string to avoid pydantic-settings JSON parsing errors
    # when env uses values like "http://localhost:5173".
    cors_origins: str = "http://localhost:5173"

    request_timeout_seconds: int = 15
    source_limit_default: int = 20

    gemini_api_key: str | None = None
    groq_api_key: str | None = None
    groq_model: str = "llama-3.1-8b-instant"
    openrouter_api_key: str | None = None
    serper_api_key: str | None = None

    firebase_project_id: str | None = None
    firebase_service_account_path: str | None = None
    require_auth: bool = False

    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_use_starttls: bool = True
    smtp_email: str | None = None
    smtp_password: str | None = None
    smtp_sender: str | None = None
    smtp_app_password: str | None = None
    smtp_rate_limit_per_min: int = 20
    smtp_timeout_seconds: int = 15
    smtp_max_attachment_bytes: int = 5 * 1024 * 1024

    max_lead_age_days: int = 5

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    @property
    def cors_origins_list(self) -> list[str]:
        value = self.cors_origins.strip()
        if not value:
            return ["http://localhost:5173"]

        if value.startswith("["):
            try:
                parsed = json.loads(value)
                if isinstance(parsed, list):
                    return [str(item).strip() for item in parsed if str(item).strip()]
            except json.JSONDecodeError:
                pass

        return [item.strip() for item in value.split(",") if item.strip()]

    @property
    def smtp_effective_sender(self) -> str | None:
        return self.smtp_email or self.smtp_sender

    @property
    def smtp_effective_password(self) -> str | None:
        return self.smtp_password or self.smtp_app_password


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    return Settings()
