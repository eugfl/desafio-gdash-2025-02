import os
from dataclasses import dataclass


def _get_env(key: str, default: str) -> str:
    value = os.getenv(key)
    if value is None:
        return default
    return value


@dataclass(frozen=True)
class AppConfig:
    """Configuração imutável do serviço Collector."""

    rabbit_url: str = os.getenv("RABBIT_URL") or _get_env(
        "RABBITMQ_URL", "amqp://guest:guest@rabbitmq:5672/"
    )
    raw_exchange: str = os.getenv("RAW_EXCHANGE") or _get_env("RAW_QUEUE", "weather.raw")
    raw_queue: str = _get_env("RAW_QUEUE", "weather.raw")
    collect_interval_seconds: int = int(_get_env("COLLECT_INTERVAL_SECONDS", "3600"))


config = AppConfig()
