import { Test, TestingModule } from '@nestjs/testing';
import { ExportService } from './export.service';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherLog } from '../entities/weather-log.entity';

const mockLog = {
  external_id: '1',
  location: { city: 'London', lat: 10, lon: 10 },
  weather: { temperature: 20, humidity: 50, wind_speed: 10, condition: 'cloudy', precipitation_mm: 0 },
  insights: ['Test'],
  pokemon_suggestions: [{ name: 'Pikachu' }],
  timestamp: new Date('2025-01-01'),
  createdAt: new Date('2025-01-01'),
};

class MockWeatherLogModel {
  static find = jest.fn();
}

describe('ExportService', () => {
    let service: ExportService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                ExportService,
                { provide: getModelToken(WeatherLog.name), useValue: MockWeatherLogModel },
            ],
        }).compile();

        service = module.get<ExportService>(ExportService);
    });

    it('deve estar definido', () => {
        expect(service).toBeDefined();
    });

    describe('exportCSV', () => {
        it('deve retornar mensagem se vazio', async () => {
            MockWeatherLogModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([]) }) });
            const result = await service.exportCSV();
            expect(result).toBe('Nenhum dado encontrado');
        });

        it('deve retornar CSV formatado', async () => {
            MockWeatherLogModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockLog]) }) });
            const result = await service.exportCSV();
            expect(result).toContain('London');
            expect(result).toContain('Pikachu');
        });
    });

    describe('exportXLSX', () => {
        it('deve retornar buffer', async () => {
            MockWeatherLogModel.find.mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([mockLog]) }) });
            const result = await service.exportXLSX();
            expect(result).toBeInstanceOf(Buffer);
        });
    });
});
