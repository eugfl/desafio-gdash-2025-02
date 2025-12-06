import { Test, TestingModule } from '@nestjs/testing';
import { WeatherController } from './weather.controller';
import { WeatherService } from './weather.service';
import { ExportService } from './services/export.service';

describe('WeatherController', () => {
    let controller: WeatherController;
    let weatherService: WeatherService;
    let exportService: ExportService;

    const mockWeatherService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        getStats: jest.fn(),
    };

    const mockExportService = {
        exportCSV: jest.fn(),
        exportXLSX: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WeatherController],
            providers: [
                { provide: WeatherService, useValue: mockWeatherService },
                { provide: ExportService, useValue: mockExportService },
            ],
        }).compile();

        controller = module.get<WeatherController>(WeatherController);
        weatherService = module.get<WeatherService>(WeatherService);
        exportService = module.get<ExportService>(ExportService);
    });

    it('deve estar definido', () => {
        expect(controller).toBeDefined();
    });

    describe('create', () => {
        it('deve chamar weatherService.create', async () => {
            const dto: any = { external_id: '1' };
            await controller.create(dto);
            expect(weatherService.create).toHaveBeenCalledWith(dto);
        });
    });

    describe('findAll', () => {
        it('deve chamar weatherService.findAll', async () => {
            await controller.findAll(1, 10, 'London');
            expect(weatherService.findAll).toHaveBeenCalledWith(1, 10, 'London');
        });
    });
    
    describe('exportCSV', () => {
        it('deve chamar exportService.exportCSV e enviar resposta', async () => {
            const mockRes = {
                setHeader: jest.fn(),
                send: jest.fn(),
            };
            mockExportService.exportCSV.mockResolvedValue('csv,content');
            
            await controller.exportCSV('London', undefined, undefined, mockRes as any);
            
            expect(exportService.exportCSV).toHaveBeenCalled();
            expect(mockRes.send).toHaveBeenCalledWith('csv,content');
        });
    });
});
