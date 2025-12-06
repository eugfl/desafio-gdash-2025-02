import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({
    example: 'token-gerado-pelo-backend',
    description: 'Token de recuperação',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: 'novaSenha123',
    description: 'Nova senha (mínimo 6 caracteres)',
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  newPassword: string;
}
