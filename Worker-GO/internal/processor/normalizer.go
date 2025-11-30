package processor

import (
	"context"
	"worker-go/internal/clients/pokeapi"
	"worker-go/internal/models"

	"go.uber.org/zap"
)

type Normalizer struct {
	pokeapiClient *pokeapi.Client
	logger        *zap.Logger
}

func NewNormalizer(pokeapiClient *pokeapi.Client, logger *zap.Logger) *Normalizer {
	return &Normalizer{
		pokeapiClient: pokeapiClient,
		logger:        logger,
	}
}

// Normalize transforma EnrichedWeatherPayload em NormalizedPayload
func (n *Normalizer) Normalize(ctx context.Context, enriched *models.EnrichedWeatherPayload) (*models.NormalizedPayload, error) {
	normalized := &models.NormalizedPayload{
		ExternalID: enriched.Base.ExternalID,
		Location:   enriched.Base.Location,
		Weather: models.WeatherData{
			Temperature:     enriched.Base.Temperature,
			Humidity:        enriched.Base.Humidity,
			WindSpeed:       enriched.Base.WindSpeed,
			Condition:       enriched.Base.Condition,
			PrecipitationMM: enriched.Base.PrecipitationMM,
		},
		Timestamp:         enriched.Base.Timestamp,
		Insights:          enriched.Insights,
		PokemonSuggestions: make([]models.EnrichedPokemon, 0, len(enriched.SuggestedPokemons)),
	}

	// Enriquece cada Pokémon sugerido com dados da PokéAPI
	for _, suggestion := range enriched.SuggestedPokemons {
		enrichedPokemon := models.EnrichedPokemon{
			Name:      suggestion.Name,
			Reasoning: suggestion.Reasoning,
		}

		// Tenta buscar dados da PokéAPI
		pokemonData, err := n.pokeapiClient.GetPokemon(ctx, suggestion.Name)
		if err != nil {
			n.logger.Warn("pokemon_not_found_or_error",
				zap.String("name", suggestion.Name),
				zap.Error(err),
			)
			// Continua sem dados PokéAPI (não é erro fatal)
		} else {
			enrichedPokemon.PokemonData = pokemonData
		}

		normalized.PokemonSuggestions = append(normalized.PokemonSuggestions, enrichedPokemon)
	}

	return normalized, nil
}

