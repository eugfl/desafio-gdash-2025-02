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
import { Response } from 'express';
import { WeatherService } from './weather.service';
import { ExportService } from './services/export.service';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';
import { Public } from '../auth/decorators/public.decorator';

@Controller('weather')
export class WeatherController {
  constructor(
    private readonly weatherService: WeatherService,
    private readonly exportService: ExportService,
  ) {}

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

  // GET /api/weather/export/csv - Export CSV
  @Get('export/csv')
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

  // GET /api/weather/export/xlsx - Export XLSX
  @Get('export/xlsx')
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
