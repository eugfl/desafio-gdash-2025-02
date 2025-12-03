import {
  Controller,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@ApiTags('Users')
@ApiBearerAuth('JWT-auth')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({
    summary: 'Ver meu perfil',
    description: 'Retorna dados do perfil do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
    schema: {
      example: {
        _id: '507f1f77bcf86cd799439011',
        name: 'João Silva',
        email: 'joao@example.com',
        city: 'São Paulo',
        role: 'user',
        provider: 'local',
        createdAt: '2025-12-01T10:00:00.000Z',
        updatedAt: '2025-12-01T10:00:00.000Z',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getMyProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  @Put('me')
  @ApiOperation({
    summary: 'Editar meu perfil',
    description: 'Atualiza nome e/ou cidade do usuário logado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil atualizado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Trocar senha',
    description: 'Atualiza senha do usuário logado',
  })
  @ApiResponse({
    status: 204,
    description: 'Senha atualizada com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Senha atual incorreta' })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async updateMyPassword(
    @CurrentUser() user: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(user.id, updatePasswordDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar todos os usuários (Admin)',
    description: 'Retorna lista de todos os usuários cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuários',
    schema: {
      example: [
        {
          _id: '507f1f77bcf86cd799439011',
          name: 'João Silva',
          email: 'joao@example.com',
          city: 'São Paulo',
          role: 'user',
        },
      ],
    },
  })
  @ApiResponse({ status: 403, description: 'Acesso negado (requer admin)' })
  async findAll(@CurrentUser() user: any) {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem listar usuários',
      );
    }
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiParam({ name: 'id', description: 'ID do usuário' })
  @ApiOperation({
    summary: 'Ver perfil de usuário específico',
    description: 'Retorna dados de um usuário (próprio perfil ou admin)',
  })
  @ApiResponse({ status: 200, description: 'Dados do usuário' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    if (user.id !== id && user.role !== 'admin') {
      throw new ForbiddenException('Sem permissão para ver este perfil');
    }
    return this.usersService.findById(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiParam({ name: 'id', description: 'ID do usuário a ser deletado' })
  @ApiOperation({
    summary: 'Deletar usuário (Admin)',
    description: 'Remove usuário do sistema',
  })
  @ApiResponse({ status: 204, description: 'Usuário deletado com sucesso' })
  @ApiResponse({ status: 403, description: 'Acesso negado (requer admin)' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem deletar usuários',
      );
    }

    if (user.id === id) {
      throw new ForbiddenException('Você não pode deletar sua própria conta');
    }

    await this.usersService.remove(id);
  }
}
