import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ForbiddenException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;

  const mockUsersService = {
    findById: jest.fn(),
    update: jest.fn(),
    updatePassword: jest.fn(),
    findAll: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('findAll', () => {
    it('deve retornar users se admin', async () => {
      await controller.findAll({ role: 'admin' });
      expect(usersService.findAll).toHaveBeenCalled();
    });

    it('deve lançar Forbidden se não for admin', async () => {
      await expect(controller.findAll({ role: 'user' })).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('deve remover se admin e não for o próprio', async () => {
      await controller.remove({ role: 'admin', id: '1' }, '2');
      expect(usersService.remove).toHaveBeenCalledWith('2');
    });

    it('deve lançar Forbidden se usuário comum', async () => {
      await expect(controller.remove({ role: 'user' }, '2')).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar Forbidden se tentar deletar a si mesmo', async () => {
        await expect(controller.remove({ role: 'admin', id: '1' }, '1')).rejects.toThrow(ForbiddenException);
      });
  });

  describe('getMyProfile', () => {
      it('deve chamar findById com id do user', async () => {
          await controller.getMyProfile({ id: '1' });
          expect(usersService.findById).toHaveBeenCalledWith('1');
      });
  });

  describe('updateMyProfile', () => {
    it('deve chamar update', async () => {
        await controller.updateMyProfile({ id: '1' }, { name: 'New' });
        expect(usersService.update).toHaveBeenCalledWith('1', { name: 'New' });
    });
});
});
