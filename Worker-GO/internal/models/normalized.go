package models

import "time"

// NormalizedPayload representa o payload normalizado enviado ao NestJS
type NormalizedPayload struct {
	ExternalID        string              `json:"external_id"`
	Location          Location            `json:"location"`
	Weather           WeatherData         `json:"weather"`
	Timestamp         time.Time           `json:"timestamp"`
	Insights          []string            `json:"insights"`
	PokemonSuggestions []EnrichedPokemon `json:"pokemon_suggestions"`
}

// WeatherData agrupa dados climáticos
type WeatherData struct {
	Temperature     float64  `json:"temperature"`
	Humidity        float64  `json:"humidity"`
	WindSpeed       float64  `json:"wind_speed"`
	Condition       string   `json:"condition"`
	PrecipitationMM *float64 `json:"precipitation_mm,omitempty"`
}

// EnrichedPokemon representa um Pokémon com dados da PokéAPI
type EnrichedPokemon struct {
	Name        string      `json:"name"`
	Reasoning   string      `json:"reasoning"`
	PokemonData *PokemonData `json:"pokemon_data,omitempty"`
}

// PokemonData contém dados completos da PokéAPI
type PokemonData struct {
	ID        int      `json:"id"`
	Types     []string `json:"types"`
	Abilities []string `json:"abilities"`
	Stats     Stats    `json:"stats"`
	Sprites   Sprites  `json:"sprites"`
}

// Stats representa estatísticas do Pokémon
type Stats struct {
	HP             int `json:"hp"`
	Attack         int `json:"attack"`
	Defense        int `json:"defense"`
	SpecialAttack  int `json:"special_attack"`
	SpecialDefense int `json:"special_defense"`
	Speed          int `json:"speed"`
}

// Sprites representa sprites do Pokémon
type Sprites struct {
	FrontDefault string `json:"front_default"`
	FrontShiny   string `json:"front_shiny,omitempty"`
}

