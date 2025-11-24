from logger import get_logger
from typing import Optional

from utils.weather_utils import (
    resolve_city_to_coords,
    fetch_weather,
    build_payload,
    WeatherClientError
)

logger = get_logger("collector.weather_client")


class WeatherClient:
    def __init__(self, timeout: int = 10):
        self.timeout = timeout

    async def fetch_weather_by_city(self, city: str) -> Optional[dict]:
        try:
            logger.info(f"🔎 Resolvendo coordenadas para cidade: {city}")
            coords = await resolve_city_to_coords(city)

            lat = coords["lat"]
            lon = coords["lon"]
            resolved_city = coords["city"]
            logger.info(f"📍 Coordenadas encontradas: {lat}, {lon} ({resolved_city})")

            weather_data = await fetch_weather(lat, lon)
            payload = build_payload(weather_data, lat, lon, resolved_city)
            logger.info("📦 Payload final pronto")

            return payload

        except WeatherClientError as e:
            logger.error(f"Erro ao coletar dados para a cidade '{city}': {e}")
            return None

        except Exception as e:
            logger.error(f"Erro inesperado ao processar a cidade '{city}': {e}")
            logger.error("TRACEBACK COMPLETO:")
            import traceback
            logger.error(traceback.format_exc())
            return None
