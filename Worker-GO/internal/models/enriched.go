package models

import "time"

// EnrichedWeatherPayload representa o payload enriquecido recebido do IA-Service
type EnrichedWeatherPayload struct {
	Base              WeatherPayload      `json:"base"`
	Insights          []string            `json:"insights"`
	RecommendedTypes  []string            `json:"recommended_types"`
	SuggestedPokemons []PokemonSuggestion `json:"suggested_pokemons"`
}

// WeatherPayload representa os dados climáticos base
type WeatherPayload struct {
	ExternalID      string    `json:"external_id"`
	Location        Location  `json:"location"`
	Temperature     float64   `json:"temperature"`
	Humidity        float64   `json:"humidity"`
	WindSpeed       float64   `json:"wind_speed"`
	Condition       string    `json:"condition"`
	PrecipitationMM *float64  `json:"precipitation_mm,omitempty"`
	Timestamp       time.Time `json:"timestamp"`
}

// Location representa coordenadas geográficas
type Location struct {
	Lat  float64 `json:"lat"`
	Lon  float64 `json:"lon"`
	City string  `json:"city"`
}

// PokemonSuggestion representa uma sugestão de Pokémon da IA
type PokemonSuggestion struct {
	Name      string `json:"name"`
	Reasoning string `json:"reasoning"`
}

