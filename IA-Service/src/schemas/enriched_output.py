from pydantic import BaseModel, Field
from typing import List
from weather_payload import WeatherPayload


class PokemonSuggestion(BaseModel):
    name: str = Field(..., description="Nome do Pokémon sugerido")
    reasoning: str = Field(..., description="Por que esse Pokémon se relaciona com o clima atual?")


class EnrichedWeatherPayload(BaseModel):
    base: WeatherPayload
    insights: List[str] = Field(..., description="Resumo inteligente gerado pela IA")
    suggested_pokemons: List[PokemonSuggestion] = Field(...,
                                                        description="Pokémons recomendados para este cenário climático")
