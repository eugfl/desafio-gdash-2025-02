import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WeatherService } from './weather.service';
import { WeatherController } from './weather.controller';
import { ExportService } from './services/export.service';
import { WeatherLog, WeatherLogSchema } from './entities/weather-log.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WeatherLog.name, schema: WeatherLogSchema },
    ]),
  ],
  controllers: [WeatherController],
  providers: [WeatherService, ExportService],
  exports: [WeatherService],
})
export class WeatherModule {}
