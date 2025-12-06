import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;
  let configService: ConfigService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    googleLogin: jest.fn(),
    completeGoogleRegistration: jest.fn(),
    forgotPassword: jest.fn(),
    resetPassword: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('deve chamar authService.login', async () => {
      const dto = { email: 'test@test.com', password: '123' };
      await controller.login(dto);
      expect(authService.login).toHaveBeenCalledWith(dto);
    });
  });

  describe('register', () => {
    it('deve chamar authService.register', async () => {
      const dto = { email: 'test@test.com', password: '123', name: 'Test', city: 'City' };
      await controller.register(dto);
      expect(authService.register).toHaveBeenCalledWith(dto);
    });
  });

  describe('googleAuthCallback', () => {
    it('deve redirecionar para callback com token se login sucesso', async () => {
      mockAuthService.googleLogin.mockResolvedValue({ access_token: 'token' });
      mockConfigService.get.mockReturnValue('http://frontend');
      const res = { redirect: jest.fn() } as unknown as Response;

      await controller.googleAuthCallback({ user: {} }, res);

      expect(res.redirect).toHaveBeenCalledWith('http://frontend/auth/callback?token=token');
    });

    it('deve redirecionar para completar registro se needsCity', async () => {
      mockAuthService.googleLogin.mockResolvedValue({ 
        needsCity: true, 
        tempToken: 'temp', 
        user: { name: 'N', email: 'E' } 
      });
      mockConfigService.get.mockReturnValue('http://frontend');
      const res = { redirect: jest.fn() } as unknown as Response;

      await controller.googleAuthCallback({ user: {} }, res);

      expect(res.redirect).toHaveBeenCalledWith(
        expect.stringContaining('complete-registration?token=temp')
      );
    });
  });

  describe('completeGoogleRegistration', () => {
    it('deve chamar service', async () => {
        await controller.completeGoogleRegistration({ tempToken: 't', city: 'c' });
        expect(authService.completeGoogleRegistration).toHaveBeenCalledWith('t', 'c');
    });
  });

  describe('forgotPassword', () => {
    it('deve chamar service', async () => {
        await controller.forgotPassword({ email: 'a@a.com' });
        expect(authService.forgotPassword).toHaveBeenCalled();
    });
  });

   describe('resetPassword', () => {
    it('deve chamar service', async () => {
        await controller.resetPassword({ token: 't', newPassword: 'p' });
        expect(authService.resetPassword).toHaveBeenCalled();
    });
  });

  describe('getProfile', () => {
      it('deve retornar user do decorator', async () => {
          const user = { id: 1 };
          const result = await controller.getProfile(user);
          expect(result).toEqual({ user });
      });
  });
});
