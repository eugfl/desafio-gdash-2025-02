package pokeapi

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"

	"worker-go/internal/config"
	"worker-go/internal/models"

	"github.com/patrickmn/go-cache"
	"go.uber.org/zap"
)

type Client struct {
	baseURL    string
	httpClient *http.Client
	cache      *cache.Cache
	logger     *zap.Logger
	mu         sync.RWMutex
}

func NewClient(cfg config.Config, logger *zap.Logger) *Client {
	return &Client{
		baseURL: cfg.PokeAPIURL,
		httpClient: &http.Client{
			Timeout: cfg.HTTPTimeout,
		},
		cache: cache.New(cfg.CacheTTL, cfg.CacheTTL*2),
		logger: logger,
	}
}

// GetPokemon busca dados de um Pokémon na PokéAPI (com cache)
func (c *Client) GetPokemon(ctx context.Context, name string) (*models.PokemonData, error) {
	// Normaliza nome (lowercase, sem espaços)
	normalizedName := strings.ToLower(strings.TrimSpace(name))
	
	// Verifica cache
	if data, found := c.cache.Get(normalizedName); found {
		c.logger.Debug("pokemon_cache_hit", zap.String("name", name))
		return data.(*models.PokemonData), nil
	}

	// Busca na API
	url := fmt.Sprintf("%s/pokemon/%s", c.baseURL, normalizedName)
	
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch pokemon: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode == http.StatusNotFound {
		return nil, fmt.Errorf("pokemon not found: %s", name)
	}

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status code: %d", resp.StatusCode)
	}

	var apiResp models.PokeAPIResponse
	if err := json.NewDecoder(resp.Body).Decode(&apiResp); err != nil {
		return nil, fmt.Errorf("failed to decode response: %w", err)
	}

	// Converte para modelo interno
	pokemonData := c.convertToPokemonData(&apiResp)

	// Armazena no cache
	c.cache.Set(normalizedName, pokemonData, cache.DefaultExpiration)

	c.logger.Info("pokemon_fetched",
		zap.String("name", name),
		zap.Int("id", pokemonData.ID),
	)

	return pokemonData, nil
}

func (c *Client) convertToPokemonData(apiResp *models.PokeAPIResponse) *models.PokemonData {
	types := make([]string, 0, len(apiResp.Types))
	for _, t := range apiResp.Types {
		types = append(types, t.Type.Name)
	}

	abilities := make([]string, 0, len(apiResp.Abilities))
	for _, a := range apiResp.Abilities {
		abilities = append(abilities, a.Ability.Name)
	}

	stats := models.Stats{}
	for _, s := range apiResp.Stats {
		switch s.Stat.Name {
		case "hp":
			stats.HP = s.BaseStat
		case "attack":
			stats.Attack = s.BaseStat
		case "defense":
			stats.Defense = s.BaseStat
		case "special-attack":
			stats.SpecialAttack = s.BaseStat
		case "special-defense":
			stats.SpecialDefense = s.BaseStat
		case "speed":
			stats.Speed = s.BaseStat
		}
	}

	return &models.PokemonData{
		ID:        apiResp.ID,
		Types:     types,
		Abilities: abilities,
		Stats:     stats,
		Sprites: models.Sprites{
			FrontDefault: apiResp.Sprites.FrontDefault,
			FrontShiny:   apiResp.Sprites.FrontShiny,
		},
	}
}

