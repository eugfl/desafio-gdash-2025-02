import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getModelToken } from '@nestjs/mongoose';
import { User } from './entities/user.entity';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { of } from 'rxjs';

const mockUser = {
  _id: '1',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashed_password',
  city: 'São Paulo',
  save: jest.fn(),
  provider: 'local',
};

class MockUserModel {
  constructor(private data: any) {
    Object.assign(this, data);
  }
  static findOne = jest.fn();
  static create = jest.fn();
  static findById = jest.fn();
  static find = jest.fn();
  static findByIdAndUpdate = jest.fn();
  static findByIdAndDelete = jest.fn();
  save = jest.fn().mockResolvedValue(mockUser);
}

describe('UsersService', () => {
  let service: UsersService;
  let model: typeof MockUserModel;
  let httpService: HttpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: MockUserModel,
        },
        {
          provide: HttpService,
          useValue: {
            post: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('http://collector:8000'),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get(getModelToken(User.name));
    httpService = module.get<HttpService>(HttpService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('deve criar um novo usuário com senha hashada', async () => {
      const dto = {
        name: 'New User',
        email: 'new@example.com',
        password: 'password123',
        city: 'Rio de Janeiro',
      };

      MockUserModel.findOne.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashed_123'));

      const result = await service.create(dto);

      expect(MockUserModel.findOne).toHaveBeenCalledWith({ email: dto.email });
      expect(result).toEqual(mockUser);
    });

    it('deve lançar conflito se email já existir', async () => {
      MockUserModel.findOne.mockResolvedValue(mockUser);
      await expect(service.create({ email: 'test@example.com' } as any)).rejects.toThrow(ConflictException);
    });
  });

  describe('findByEmail', () => {
    it('deve retornar um usuário se encontrado', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      MockUserModel.findOne.mockReturnValue({ exec: mockExec });

      const result = await service.findByEmail('test@example.com');
      expect(result).toEqual(mockUser);
    });
  });

  describe('onModuleInit (Default User)', () => {
    it('deve criar usuário admin se não existir', async () => {
      MockUserModel.findOne.mockResolvedValue(null);
      await service.onModuleInit();
      expect(MockUserModel.create).toHaveBeenCalled();
    });

    it('não deve criar se já existir', async () => {
        MockUserModel.findOne.mockResolvedValue(mockUser);
      await service.onModuleInit();
      expect(MockUserModel.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    it('deve atualizar o usuário', async () => {
      // Mock findById (antes do update)
      const mockExecFindBy = jest.fn().mockResolvedValue(mockUser);
      MockUserModel.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockExecFindBy }) });

      // Mock findByIdAndUpdate
      const mockExecUpdate = jest.fn().mockResolvedValue({ ...mockUser, name: 'Updated' });
      MockUserModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockExecUpdate }) });

      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });

    it('deve disparar coleta se cidade mudar', async () => {
      const mockExecFindBy = jest.fn().mockResolvedValue(mockUser);
      MockUserModel.findById.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockExecFindBy }) });

      const mockExecUpdate = jest.fn().mockResolvedValue({ ...mockUser, city: 'New City' });
      MockUserModel.findByIdAndUpdate.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockExecUpdate }) });
      
      jest.spyOn(httpService, 'post').mockReturnValue(of({ data: {} }) as any);

      await service.update('1', { city: 'New City' });
      expect(httpService.post).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('deve remover usuário', async () => {
      const mockExec = jest.fn().mockResolvedValue(mockUser);
      MockUserModel.findByIdAndDelete.mockReturnValue({ exec: mockExec });

      await service.remove('1');
      expect(MockUserModel.findByIdAndDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('findAll', () => {
    it('deve retornar lista de usuários', async () => {
      const mockExec = jest.fn().mockResolvedValue([mockUser]);
      MockUserModel.find.mockReturnValue({ select: jest.fn().mockReturnValue({ exec: mockExec }) });

      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });
  });
});
