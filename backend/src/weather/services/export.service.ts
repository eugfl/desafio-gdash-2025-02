import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from '../entities/weather-log.entity';
import * as ExcelJS from 'exceljs';

@Injectable()
export class ExportService {
  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  // Buscar dados para export
  private async getData(city?: string, startDate?: string, endDate?: string) {
    const query: any = {};

    if (city) {
      query['location.city'] = city;
    }

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    return this.weatherLogModel.find(query).sort({ timestamp: -1 }).exec();
  }

  // Transformar dados em formato tabular
  private transformData(logs: WeatherLogDocument[]) {
    return logs.map((log) => ({
      'ID Externo': log.external_id,
      Cidade: log.location.city,
      Latitude: log.location.lat,
      Longitude: log.location.lon,
      'Temperatura (°C)': log.weather.temperature,
      'Umidade (%)': log.weather.humidity,
      'Velocidade do Vento (km/h)': log.weather.wind_speed,
      Condição: log.weather.condition,
      'Precipitação (mm)': log.weather.precipitation_mm || 0,
      Insights: log.insights.join(' | '),
      'Pokémons Sugeridos': log.pokemon_suggestions
        .map((p) => p.name)
        .join(', '),
      'Data/Hora': new Date(log.timestamp).toLocaleString('pt-BR'),
      'Criado em': log.createdAt
        ? new Date(log.createdAt).toLocaleString('pt-BR')
        : 'N/A',
    }));
  }

  // Exportar CSV (geração manual)
  async exportCSV(
    city?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<string> {
    const logs = await this.getData(city, startDate, endDate);
    const data = this.transformData(logs);

    if (data.length === 0) {
      return 'Nenhum dado encontrado';
    }

    // Gerar CSV manualmente
    const headers = Object.keys(data[0]);
    const headerRow = headers.join(',');

    const dataRows = data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Escapar valores com vírgula ou aspas
          if (
            typeof value === 'string' &&
            (value.includes(',') || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(','),
    );

    return [headerRow, ...dataRows].join('\n');
  }

  // Exportar XLSX
  async exportXLSX(
    city?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<Buffer> {
    const logs = await this.getData(city, startDate, endDate);
    const data = this.transformData(logs);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Logs Climáticos');

    // Adicionar headers
    if (data.length > 0) {
      worksheet.columns = Object.keys(data[0]).map((key) => ({
        header: key,
        key: key,
        width: 20,
      }));

      // Adicionar dados
      data.forEach((row) => {
        worksheet.addRow(row);
      });

      // Estilizar header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' },
      };
      worksheet.getRow(1).font = { color: { argb: 'FFFFFFFF' }, bold: true };
    }

    // Gerar buffer
    return Buffer.from(await workbook.xlsx.writeBuffer());
  }
}
