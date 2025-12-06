import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({
    example: 'usuario@example.com',
    description: 'Email do usuário',
  })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;
}
