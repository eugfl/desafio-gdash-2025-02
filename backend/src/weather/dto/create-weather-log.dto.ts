import {
  IsString,
  IsNumber,
  IsArray,
  IsObject,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

class LocationDto {
  @ApiProperty({ example: 'São Paulo', description: 'Nome da cidade' })
  @IsString()
  city: string;

  @ApiProperty({ example: -23.55, description: 'Latitude' })
  @IsNumber()
  lat: number;

  @ApiProperty({ example: -46.63, description: 'Longitude' })
  @IsNumber()
  lon: number;
}

class WeatherDataDto {
  @ApiProperty({ example: 25.5, description: 'Temperatura em °C' })
  @IsNumber()
  temperature: number;

  @ApiProperty({ example: 60, description: 'Umidade em %' })
  @IsNumber()
  humidity: number;

  @ApiProperty({ example: 10.5, description: 'Velocidade do vento em km/h' })
  @IsNumber()
  wind_speed: number;

  @ApiProperty({ example: 'céu limpo', description: 'Condição climática' })
  @IsString()
  condition: string;

  @ApiProperty({
    example: 0,
    description: 'Precipitação em mm',
    required: false,
  })
  @IsNumber()
  @IsOptional()
  precipitation_mm?: number;
}

class PokemonDataDto {
  @ApiProperty({ example: 4, description: 'ID do Pokémon' })
  @IsNumber()
  id: number;

  @ApiProperty({ example: ['fire'], description: 'Tipos do Pokémon' })
  @IsArray()
  types: string[];

  @ApiProperty({
    example: ['blaze', 'solar-power'],
    description: 'Habilidades do Pokémon',
  })
  @IsArray()
  abilities: string[];

  @ApiProperty({
    example: { hp: 39, attack: 52, defense: 43 },
    description: 'Estatísticas do Pokémon',
  })
  @IsObject()
  stats: object;

  @ApiProperty({
    example: { front_default: 'https://...' },
    description: 'Sprites do Pokémon',
  })
  @IsObject()
  sprites: object;
}

class PokemonSuggestionDto {
  @ApiProperty({ example: 'Charmander', description: 'Nome do Pokémon' })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'Tipo fire - apropriado para clima ensolarado',
    description: 'Justificativa da sugestão',
  })
  @IsString()
  reasoning: string;

  @ApiProperty({
    type: PokemonDataDto,
    description: 'Dados completos do Pokémon da PokéAPI',
    required: false,
  })
  @IsObject()
  @IsOptional()
  pokemon_data?: PokemonDataDto;
}

export class CreateWeatherLogDto {
  @ApiProperty({
    example: 'd4cfe3a0-e1c5-4db0-ba03-aad17828f34a',
    description: 'ID único gerado pelo Collector',
  })
  @IsString()
  external_id: string;

  @ApiProperty({ type: LocationDto, description: 'Localização' })
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ type: WeatherDataDto, description: 'Dados climáticos' })
  @ValidateNested()
  @Type(() => WeatherDataDto)
  weather: WeatherDataDto;

  @ApiProperty({
    example: [
      'Clima agradável para atividades ao ar livre',
      'Baixa probabilidade de chuva',
    ],
    description: 'Insights gerados pela IA',
  })
  @IsArray()
  @IsString({ each: true })
  insights: string[];

  @ApiProperty({
    type: [PokemonSuggestionDto],
    description: 'Pokémons sugeridos com base no clima',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PokemonSuggestionDto)
  pokemon_suggestions: PokemonSuggestionDto[];

  @ApiProperty({
    example: '2025-12-03T10:00:00.000Z',
    description: 'Timestamp do registro',
  })
  @IsString()
  timestamp: string;
}
