from pydantic import BaseModel, Field
from typing import List
from schemas.weather_payload import WeatherPayload


class PokemonSuggestion(BaseModel):
    name: str = Field(..., description="Nome do Pokémon sugerido")
    reasoning: str = Field(..., description="Por que esse Pokémon se relaciona com o clima atual?")


class EnrichedWeatherPayload(BaseModel):
    base: WeatherPayload
    recommended_types: List[str] = Field(
        default_factory=list,
        description="Tipos de pokémon sugeridos para o clima atual",
    )
    insights: List[str] = Field(
        default_factory=list, description="Resumo inteligente gerado pela IA"
    )
    suggested_pokemons: List[PokemonSuggestion] = Field(
        default_factory=list,
        description="Pokémons recomendados para este cenário climático",
    )
