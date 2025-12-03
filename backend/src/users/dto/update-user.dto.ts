import { PartialType, OmitType } from '@nestjs/mapped-types';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, [
    'email',
    'password',
    'provider',
    'googleId',
  ] as const),
) {
  @ApiProperty({
    example: 'João Pedro Silva',
    description: 'Nome completo do usuário',
    required: false,
  })
  name?: string;

  @ApiProperty({
    example: 'Rio de Janeiro',
    description: 'Cidade do usuário',
    required: false,
  })
  city?: string;

  @ApiProperty({
    example: 'https://example.com/avatar.jpg',
    description: 'URL da foto de perfil',
    required: false,
  })
  picture?: string;
}
