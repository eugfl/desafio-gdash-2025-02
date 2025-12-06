import { Test, TestingModule } from '@nestjs/testing';
import { WeatherService } from './weather.service';
import { getModelToken } from '@nestjs/mongoose';
import { WeatherLog } from './entities/weather-log.entity';
import { ConflictException } from '@nestjs/common';

const mockWeatherLog = {
  _id: '1',
  external_id: 'uuid-123',
  location: { city: 'São Paulo' },
  weather: { temperature: 25 },
  save: jest.fn(),
};

class MockWeatherLogModel {
  constructor(private data: any) {
    Object.assign(this, data);
  }
  static find = jest.fn();
  static countDocuments = jest.fn();
  static findById = jest.fn();
  static aggregate = jest.fn();
  
  save() {
    return Promise.resolve(mockWeatherLog);
  }
}

describe('WeatherService', () => {
  let service: WeatherService;
  let model: typeof MockWeatherLogModel;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WeatherService,
        {
          provide: getModelToken(WeatherLog.name),
          useValue: MockWeatherLogModel,
        },
      ],
    }).compile();

    service = module.get<WeatherService>(WeatherService);
    model = module.get(getModelToken(WeatherLog.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve salvar um novo log', async () => {
      const dto: any = {
        external_id: 'uuid-123',
        location: { city: 'São Paulo', lat: 0, lon: 0 },
        weather: { temperature: 25, humidity: 60, condition: 'sol' },
        timestamp: new Date().toISOString(),
      };

      const result = await service.create(dto);

      expect(result).toEqual(mockWeatherLog);
    });

    it('deve lançar ConflictException se duplicado', async () => {
      // Mock para simular erro de duplicação do Mongo (código 11000)
      jest.spyOn(MockWeatherLogModel.prototype, 'save').mockImplementationOnce(() => {
        const err: any = new Error('Duplicate');
        err.code = 11000;
        throw err;
      });

      const dto: any = { external_id: 'dup' };

      await expect(service.create(dto)).rejects.toThrow(ConflictException);
    });
  });

  describe('findAll', () => {
    it('deve retornar lista paginada', async () => {
      const mockData = [mockWeatherLog];
      const mockTotal = 1;

      // Mock chainable find().sort().limit().skip().exec()
      const mockExec = jest.fn().mockResolvedValue(mockData);
      const mockSkip = jest.fn().mockReturnValue({ exec: mockExec });
      const mockLimit = jest.fn().mockReturnValue({ skip: mockSkip });
      const mockSort = jest.fn().mockReturnValue({ limit: mockLimit });
      MockWeatherLogModel.find.mockReturnValue({ sort: mockSort });
      MockWeatherLogModel.countDocuments.mockResolvedValue(mockTotal);

      const result = await service.findAll(1, 10, 'São Paulo');

      expect(result.data).toEqual(mockData);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('getStats', () => {
    it('deve retornar estatísticas', async () => {
      const mockStats = [{ avgTemp: 25, count: 10 }];
      MockWeatherLogModel.aggregate.mockResolvedValue(mockStats);

      const result = await service.getStats('São Paulo');

      expect(result).toEqual(mockStats[0]);
    });

    it('deve retornar null se não houver dados', async () => {
        MockWeatherLogModel.aggregate.mockResolvedValue([]);
  
        const result = await service.getStats('São Paulo');
  
        expect(result).toBeNull();
      });
  });
});
