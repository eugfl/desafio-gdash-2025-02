import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Res,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { Response } from 'express';
import { WeatherService } from './weather.service';
import { ExportService } from './services/export.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('Weather')
@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly exportService: ExportService,
  ) {}

  @Public()
  @Post('logs')
  @ApiOperation({
    summary: 'Criar log climático (Worker-Go)',
    description:
      'Endpoint público usado pelo Worker-Go para enviar dados processados da pipeline',
  })
  @ApiBody({ type: CreateWeatherLogDto })
  @ApiResponse({
    status: 201,
    description: 'Log criado com sucesso',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        external_id: 'd4cfe3a0-e1c5-4db0-ba03-aad17828f34a',
        location: {
          city: 'São Paulo',
          lat: -23.55,
          lon: -46.63,
        },
        weather: {
          temperature: 25,
          humidity: 60,
          wind_speed: 10,
          condition: 'céu limpo',
          precipitation_mm: 0,
        },
        insights: [
          'Clima agradável para atividades ao ar livre',
          'Baixa probabilidade de chuva',
        ],
        pokemon_suggestions: [
          {
            name: 'Charmander',
            reasoning: 'Tipo fire - apropriado para clima ensolarado',
            pokemon_data: {
              id: 4,
              types: ['fire'],
              abilities: ['blaze', 'solar-power'],
              stats: { hp: 39, attack: 52, defense: 43 },
              sprites: {
                front_default: 'https://...',
              },
            },
          },
        ],
        timestamp: '2025-12-03T10:00:00.000Z',
        createdAt: '2025-12-03T10:00:01.000Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Log já existe (external_id duplicado)',
  })
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  @Get('logs')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Listar logs climáticos',
    description:
      'Retorna lista paginada de logs climáticos com filtros opcionais',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Número da página',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Itens por página',
    example: 20,
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar por cidade',
    example: 'São Paulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de logs',
    schema: {
      example: {
        data: [
          {
            _id: '507f1f77bcf86cd799439011',
            external_id: 'd4cfe3a0-e1c5-4db0-ba03-aad17828f34a',
            location: { city: 'São Paulo', lat: -23.55, lon: -46.63 },
            weather: {
              temperature: 25,
              humidity: 60,
              wind_speed: 10,
              condition: 'céu limpo',
            },
            insights: ['Clima agradável...'],
            pokemon_suggestions: [{ name: 'Charmander', reasoning: '...' }],
            timestamp: '2025-12-03T10:00:00.000Z',
          },
        ],
        meta: {
          page: 1,
          limit: 20,
          total: 50,
          pages: 3,
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('city') city?: string,
  ) {
    return this.weatherService.findAll(page, limit, city);
  }

  @Get('logs/:id')
  @ApiBearerAuth('JWT-auth')
  @ApiParam({ name: 'id', description: 'ID do log climático' })
  @ApiOperation({
    summary: 'Buscar log específico',
    description: 'Retorna detalhes de um log climático específico',
  })
  @ApiResponse({
    status: 200,
    description: 'Detalhes do log',
  })
  @ApiResponse({ status: 404, description: 'Log não encontrado' })
  async findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  @Get('stats')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Estatísticas climáticas',
    description: 'Retorna estatísticas agregadas dos dados climáticos',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar estatísticas por cidade',
    example: 'São Paulo',
  })
  @ApiResponse({
    status: 200,
    description: 'Estatísticas calculadas',
    schema: {
      example: {
        avgTemp: 25.5,
        maxTemp: 32.0,
        minTemp: 18.0,
        avgHumidity: 65.5,
        count: 150,
      },
    },
  })
  async getStats(@Query('city') city?: string) {
    return this.weatherService.getStats(city);
  }

  @Get('export/csv')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Exportar dados em CSV',
    description: 'Gera arquivo CSV com dados climáticos filtrados',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar por cidade',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data inicial (ISO 8601)',
    example: '2025-12-01',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data final (ISO 8601)',
    example: '2025-12-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo CSV gerado',
    content: {
      'text/csv': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportCSV(
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const csv = await this.exportService.exportCSV(city, startDate, endDate);

    const filename = `weather-logs-${Date.now()}.csv`;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }

  @Get('export/xlsx')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Exportar dados em Excel',
    description: 'Gera arquivo XLSX com dados climáticos filtrados',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    type: String,
    description: 'Filtrar por cidade',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Data inicial (ISO 8601)',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Data final (ISO 8601)',
  })
  @ApiResponse({
    status: 200,
    description: 'Arquivo Excel gerado',
    content: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async exportXLSX(
    @Query('city') city?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Res() res?: Response,
  ) {
    const buffer = await this.exportService.exportXLSX(
      city,
      startDate,
      endDate,
    );

    const filename = `weather-logs-${Date.now()}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(buffer);
  }
}
