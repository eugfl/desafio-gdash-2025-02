import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({
    example: '123456',
    description: 'Senha atual do usuário',
  })
  @IsString()
  currentPassword: string;

  @ApiProperty({
    example: 'novaSenha123',
    description: 'Nova senha (mínimo 6 caracteres)',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  newPassword: string;
}
