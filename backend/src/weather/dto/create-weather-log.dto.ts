import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class LocationDto {
  @IsString()
  city: string;

  @IsNumber()
  lat: number;

  @IsNumber()
  lon: number;
}

class WeatherDataDto {
  @IsNumber()
  temperature: number;

  @IsNumber()
  humidity: number;

  @IsNumber()
  wind_speed: number;

  @IsString()
  condition: string;

  @IsNumber()
  @IsOptional()
  precipitation_mm?: number;
}

class PokemonSuggestionDto {
  @IsString()
  name: string;

  @IsString()
  reasoning: string;

  @IsObject()
  @IsOptional()
  pokemon_data?: any;
}

export class CreateWeatherLogDto {
  @IsString()
  external_id: string;

  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ValidateNested()
  @Type(() => WeatherDataDto)
  weather: WeatherDataDto;

  @IsArray()
  @IsString({ each: true })
  insights: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PokemonSuggestionDto)
  pokemon_suggestions: PokemonSuggestionDto[];

  @IsString()
  timestamp: string;
}
