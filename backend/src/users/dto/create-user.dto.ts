import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Pedro Silva',
    description: 'Nome completo do usuário',
    required: true,
  })
  @IsString()
  @MinLength(2)
  name: string;

  @ApiProperty({
    example: 'usuario@example.com',
    description: 'E-mail do usuário',
    required: true,
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'senha123',
    description:
      'Senha do usuário. Opcional quando autenticação é feita via provider externo.',
    required: false,
  })
  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @ApiProperty({
    example: 'Rio de Janeiro',
    description: 'Cidade do usuário',
    required: true,
  })
  @IsString()
  @MinLength(2)
  city: string;

  @ApiProperty({
    example: 'google',
    description: 'Provider de autenticação caso a conta seja criada via OAuth',
    required: false,
  })
  @IsString()
  @IsOptional()
  provider?: string;

  @ApiProperty({
    example: '1234567890',
    description: 'ID do Google caso o login seja feito via Google OAuth',
    required: false,
  })
  @IsString()
  @IsOptional()
  googleId?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL da foto de perfil do usuário',
    required: false,
  })
  @IsString()
  @IsOptional()
  picture?: string;
}
