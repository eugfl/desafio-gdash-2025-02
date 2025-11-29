from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class Location(BaseModel):
    lat: float = Field(..., description="Latitude da localização consultada")
    lon: float = Field(..., description="Longitude da localização consultada")
    city: str = Field(..., description="Nome da cidade consultada")


class WeatherPayload(BaseModel):
    external_id: str = Field(..., description="ID externo único gerado pelo Collector")
    location: Location
    temperature: float = Field(..., description="Temperatura em °C")
    humidity: float = Field(..., description="Percentual de umidade do ar")
    wind_speed: float = Field(..., description="Velocidade do vento em km/h")
    condition: str = Field(..., description="Descrição traduzida da condição meteorológica")
    precipitation_mm: Optional[float] = Field(None, description="Milímetros de chuva acumulada")
    timestamp: datetime = Field(..., description="Data/Hora do registro no formato ISO-8601")
