export interface Location {
  city: string;
  lat: number;
  lon: number;
}

export interface WeatherData {
  temperature: number;
  humidity: number;
  wind_speed: number;
  condition: string;
  precipitation_mm?: number;
}

export interface PokemonData {
  id: number;
  types: string[];
  abilities: string[];
  stats: {
    hp: number;
    attack: number;
    defense: number;
    special_attack: number;
    special_defense: number;
    speed: number;
  };
  sprites: {
    front_default: string;
    front_shiny?: string;
  };
}

export interface PokemonSuggestion {
  name: string;
  reasoning: string;
  pokemon_data?: PokemonData;
}

export interface WeatherLog {
  _id: string;
  external_id: string;
  location: Location;
  weather: WeatherData;
  insights: string[];
  pokemon_suggestions: PokemonSuggestion[];
  timestamp: string;
  createdAt: string;
  updatedAt: string;
}

export interface WeatherStats {
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  avgHumidity: number;
  count: number;
}

export interface WeatherLogsResponse {
  data: WeatherLog[];
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
