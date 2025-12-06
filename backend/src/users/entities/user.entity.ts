import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true, lowercase: true })
  email: string;

  @Prop({ required: false })
  password?: string;

  @Prop({ required: true })
  city: string;

  @Prop({ default: 'user' })
  role: string;

  @Prop({ default: 'local' })
  provider: string;

  @Prop({ required: false })
  googleId?: string;

  @Prop({ required: false })
  picture?: string;

  @Prop({ required: false })
  resetPasswordToken?: string;

  @Prop({ required: false })
  resetPasswordExpires?: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.index({ googleId: 1 });
