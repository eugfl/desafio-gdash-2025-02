import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WeatherLogDocument = WeatherLog & Document;

@Schema({ timestamps: true })
export class WeatherLog {
  @Prop({ required: true, unique: true })
  external_id: string;

  @Prop({ type: Object, required: true })
  location: {
    city: string;
    lat: number;
    lon: number;
  };

  @Prop({ type: Object, required: true })
  weather: {
    temperature: number;
    humidity: number;
    wind_speed: number;
    condition: string;
    precipitation_mm?: number;
  };

  @Prop({ type: [String], default: [] })
  insights: string[];

  @Prop({ type: [Object], default: [] })
  pokemon_suggestions: Array<{
    name: string;
    reasoning: string;
    pokemon_data?: {
      id: number;
      types: string[];
      abilities: string[];
      stats: object;
      sprites: object;
    };
  }>;

  @Prop({ required: true })
  timestamp: Date;

  createdAt?: Date;
  updatedAt?: Date;
}

export const WeatherLogSchema = SchemaFactory.createForClass(WeatherLog);

WeatherLogSchema.index({ external_id: 1 });
WeatherLogSchema.index({ 'location.city': 1, timestamp: -1 });
WeatherLogSchema.index({ timestamp: -1 });
