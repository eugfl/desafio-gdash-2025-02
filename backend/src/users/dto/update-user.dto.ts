import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    example: 'João Pedro Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @ApiProperty({
    example: 'Rio de Janeiro',
    description: 'Cidade do usuário',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(2)
  city?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL da foto de perfil',
    required: false,
  })
  @IsOptional()
  @IsString()
  picture?: string;
}
