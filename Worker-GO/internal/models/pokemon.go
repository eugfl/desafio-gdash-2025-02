package models

// PokeAPIResponse representa a resposta completa da PokéAPI
type PokeAPIResponse struct {
	ID      int    `json:"id"`
	Name    string `json:"name"`
	Types   []Type `json:"types"`
	Abilities []Ability `json:"abilities"`
	Stats   []StatEntry `json:"stats"`
	Sprites PokeAPISprites `json:"sprites"`
}

// Type representa um tipo do Pokémon
type Type struct {
	Type struct {
		Name string `json:"name"`
	} `json:"type"`
}

// Ability representa uma habilidade
type Ability struct {
	Ability struct {
		Name string `json:"name"`
	} `json:"ability"`
}

// StatEntry representa uma entrada de estatística
type StatEntry struct {
	BaseStat int `json:"base_stat"`
	Stat     struct {
		Name string `json:"name"`
	} `json:"stat"`
}

// PokeAPISprites representa os sprites da PokéAPI
type PokeAPISprites struct {
	FrontDefault string `json:"front_default"`
	FrontShiny   string `json:"front_shiny"`
}

