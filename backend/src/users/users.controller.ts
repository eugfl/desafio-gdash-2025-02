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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // GET /api/users/me - Ver meu perfil
  @Get('me')
  async getMyProfile(@CurrentUser() user: any) {
    return this.usersService.findById(user.id);
  }

  // PUT /api/users/me - Editar meu perfil
  @Put('me')
  async updateMyProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  // PUT /api/users/me/password - Trocar senha
  @Put('me/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async updateMyPassword(
    @CurrentUser() user: any,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    await this.usersService.updatePassword(user.id, updatePasswordDto);
  }

  // GET /api/users - Listar todos (admin only)
  @Get()
  async findAll(@CurrentUser() user: any) {
    // Verificar se é admin
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem listar usuários',
      );
    }
    return this.usersService.findAll();
  }

  // GET /api/users/:id - Ver perfil de outro usuário (admin only)
  @Get(':id')
  async findOne(@CurrentUser() user: any, @Param('id') id: string) {
    // Pode ver próprio perfil ou ser admin
    if (user.id !== id && user.role !== 'admin') {
      throw new ForbiddenException('Sem permissão para ver este perfil');
    }
    return this.usersService.findById(id);
  }

  // DELETE /api/users/:id - Deletar usuário (admin only)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@CurrentUser() user: any, @Param('id') id: string) {
    if (user.role !== 'admin') {
      throw new ForbiddenException(
        'Apenas administradores podem deletar usuários',
      );
    }

    // Não pode deletar a si mesmo
    if (user.id === id) {
      throw new ForbiddenException('Você não pode deletar sua própria conta');
    }

    await this.usersService.remove(id);
  }
}
