import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { WeatherService } from './weather.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  // POST /api/weather/logs - Worker-Go envia dados (público)
  @Public()
  @Post('logs')
  async create(@Body() createWeatherLogDto: CreateWeatherLogDto) {
    return this.weatherService.create(createWeatherLogDto);
  }

  // GET /api/weather/logs - Listar logs (protegido)
  @Get('logs')
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
    @Query('city') city?: string,
  ) {
    return this.weatherService.findAll(page, limit, city);
  }

  // GET /api/weather/logs/:id - Buscar específico
  @Get('logs/:id')
  async findOne(@Param('id') id: string) {
    return this.weatherService.findOne(id);
  }

  // GET /api/weather/stats - Estatísticas
  @Get('stats')
  async getStats(@Query('city') city?: string) {
    return this.weatherService.getStats(city);
  }
}
