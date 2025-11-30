from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    payment_service_url: str
    payment_api_key: str
    agent_identifier: str
    payment_amount: int = 10_000_000
    payment_unit: str = "lovelace"
    seller_vkey: str
    network: str = "Preprod"

    sokosumi_base_url: str
    sokosumi_api_key: str
    sokosumi_agent_id: str | None = None
    sokosumi_heartbeat_seconds: int = 60

    openai_api_key: str
    openai_model: str = "gpt-4o-mini"
    orchestrator_name: str = "MasumiCrewOrchestrator"
    orchestrator_version: str = "0.1.0"
    max_parallel_jobs: int = 3

    redis_url: str | None = None
    job_ttl_seconds: int = 3600

    log_level: str = "INFO"
    sentry_dsn: str | None = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
