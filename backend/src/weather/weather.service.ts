import { Injectable, Logger, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { WeatherLog, WeatherLogDocument } from './entities/weather-log.entity';
import { CreateWeatherLogDto } from './dto/create-weather-log.dto';

@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    @InjectModel(WeatherLog.name)
    private weatherLogModel: Model<WeatherLogDocument>,
  ) {}

  // Receber dados do Worker-Go
  async create(createWeatherLogDto: CreateWeatherLogDto) {
    try {
      const weatherLog = new this.weatherLogModel({
        ...createWeatherLogDto,
        timestamp: new Date(createWeatherLogDto.timestamp),
      });

      const saved = await weatherLog.save();

      this.logger.log(
        `✅ Weather log salvo: ${saved.external_id} - ${saved.location.city}`,
      );

      return saved;
    } catch (error) {
      if (error.code === 11000) {
        // Duplicate key (external_id já existe)
        throw new ConflictException('Log já processado anteriormente');
      }
      throw error;
    }
  }

  // Listar logs (com paginação)
  async findAll(page = 1, limit = 20, city?: string) {
    const query = city ? { 'location.city': city } : {};

    const [data, total] = await Promise.all([
      this.weatherLogModel
        .find(query)
        .sort({ timestamp: -1 })
        .limit(limit)
        .skip((page - 1) * limit)
        .exec(),
      this.weatherLogModel.countDocuments(query),
    ]);

    return {
      data,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  // Buscar por ID
  async findOne(id: string) {
    return this.weatherLogModel.findById(id).exec();
  }

  // Estatísticas
  async getStats(city?: string) {
    const match = city ? { 'location.city': city } : {};

    const stats = await this.weatherLogModel.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          avgTemp: { $avg: '$weather.temperature' },
          maxTemp: { $max: '$weather.temperature' },
          minTemp: { $min: '$weather.temperature' },
          avgHumidity: { $avg: '$weather.humidity' },
          count: { $sum: 1 },
        },
      },
    ]);

    return stats[0] || null;
  }
}
