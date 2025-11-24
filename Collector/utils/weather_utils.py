import uuid
from logger import get_logger
import httpx
from typing import Dict, Optional
from datetime import datetime, timezone
import traceback

logger = get_logger("collector.weather")

WEATHER_CODE_MAP = {
    0: "céu limpo",
    1: "principalmente claro",
    2: "parcialmente nublado",
    3: "nublado",
    45: "neblina",
    48: "neblina gelada",
    51: "chuvisco leve",
    53: "chuvisco moderado",
    55: "chuvisco intenso",
    56: "chuvisco congelante leve",
    57: "chuvisco congelante intenso",
    61: "chuva leve",
    63: "chuva moderada",
    65: "chuva forte",
    66: "chuva congelante leve",
    67: "chuva congelante intensa",
    71: "neve leve",
    73: "neve moderada",
    75: "neve forte",
    77: "granizo de neve",
    80: "aguaceiros leves",
    81: "aguaceiros moderados",
    82: "aguaceiros intensos",
    85: "nevasca leve",
    86: "nevasca intensa",
    95: "trovoada",
    96: "trovoada com granizo leve",
    99: "trovoada com granizo forte",
}


class WeatherClientError(Exception):
    """Exceção customizada para erros no client de weather"""
    pass


async def resolve_city_to_coords(city: str) -> Dict:
    try:
        url = "https://geocoding-api.open-meteo.com/v1/search"
        params = {"name": city, "count": 10, "language": "pt", "format": "json"}

        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, timeout=10)
            r.raise_for_status()  # Levanta exceção se status != 2xx

        data = r.json()

        if not data.get("results"):
            msg = f"Nenhum resultado encontrado para cidade='{city}'"
            logger.warning(msg)
            raise WeatherClientError(msg)

        item = data["results"][0]

        return {
            "lat": item["latitude"],
            "lon": item["longitude"],
            "city": item.get("name", city),
        }

    except Exception as e:
        logger.error(f"Erro ao resolver cidade '{city}': {e}")
        logger.error("TRACEBACK COMPLETO:")
        logger.error(traceback.format_exc())
        raise WeatherClientError(f"Falha ao resolver cidade '{city}': {e}") from e


async def fetch_weather(lat: float, lon: float) -> Dict:
    try:
        url = "https://api.open-meteo.com/v1/forecast"
        params = {
            "latitude": lat,
            "longitude": lon,
            "current": "temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code,precipitation",
            "timezone": "UTC",
        }

        async with httpx.AsyncClient() as client:
            r = await client.get(url, params=params, timeout=10)
            r.raise_for_status()

        data = r.json()
        current = data.get("current", {})

        if not current:
            msg = f"Nenhum dado de clima retornado para lat={lat}, lon={lon}"
            logger.warning(msg)
            raise WeatherClientError(msg)

        return {
            "temperature": current.get("temperature_2m"),
            "humidity": current.get("relative_humidity_2m"),
            "wind_speed": current.get("wind_speed_10m"),
            "weather_code": current.get("weather_code"),
            "precipitation_mm": current.get("precipitation"),
            "timestamp": datetime.now(timezone.utc).timestamp(),
        }

    except Exception as e:
        logger.error(f"Erro ao coletar dados de lat={lat}, lon={lon}: {e}")
        logger.error("TRACEBACK COMPLETO:")
        logger.error(traceback.format_exc())
        raise WeatherClientError(f"Falha ao coletar clima para lat={lat}, lon={lon}: {e}") from e


def map_condition(code: Optional[int]) -> str:
    if code is None:
        return "desconhecido"
    return WEATHER_CODE_MAP.get(code, f"codigo_{code}")


def build_payload(data: Dict, lat: float, lon: float, city: str) -> Dict:
    return {
        "external_id": str(uuid.uuid4()),
        "location": {"lat": lat, "lon": lon, "city": city},
        "temperature": data.get("temperature"),
        "humidity": data.get("humidity"),
        "wind_speed": data.get("wind_speed"),
        "condition": map_condition(data.get("weather_code")),
        "precipitation_mm": data.get("precipitation_mm"),
        "timestamp": data.get("timestamp"),
    }
