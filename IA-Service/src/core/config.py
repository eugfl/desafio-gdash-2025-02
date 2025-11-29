import os
from dataclasses import dataclass


def _get_env(key: str, default: str) -> str:
    value = os.getenv(key)
    if value is None:
        return default
    return value


@dataclass(frozen=True)
class AppConfig:
    """Configuração imutável do serviço de IA."""

    rabbit_url: str = os.getenv("RABBIT_URL") or _get_env(
        "RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"
    )
    raw_queue: str = _get_env("RAW_QUEUE", "weather.raw")
    enriched_queue: str = _get_env("ENRICHED_QUEUE", "weather.enriched")
    groq_api_key: str = _get_env("GROQ_API_KEY", "")


config = AppConfig()
