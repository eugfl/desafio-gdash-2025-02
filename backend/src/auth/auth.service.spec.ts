import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';
import { UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';
import { of } from 'rxjs';

const mockUser = {
  _id: '1',
  email: 'test@example.com',
  password: 'hashed',
  provider: 'local',
  city: 'São Paulo',
  name: 'Test',
  role: 'user',
};

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;
  let mailerService: MailerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findByEmail: jest.fn(),
            validatePassword: jest.fn(),
            create: jest.fn(),
            findByGoogleId: jest.fn(),
            setResetPasswordToken: jest.fn(),
            resetPassword: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('token'),
            verify: jest.fn(),
          },
        },
        {
            provide: HttpService,
            useValue: {
              post: jest.fn().mockReturnValue(of({ data: {} })),
            },
        },
        {
            provide: ConfigService,
            useValue: { get: jest.fn() },
        },
        {
            provide: MailerService,
            useValue: { sendMail: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
    mailerService = module.get<MailerService>(MailerService);
  });

  describe('googleLogin', () => {
    it('deve retornar token se usuário já existe via googleId', async () => {
      jest.spyOn(usersService, 'findByGoogleId').mockResolvedValue(mockUser as any);
      const result = await service.googleLogin({ googleId: 'g1' });
      expect(result).toHaveProperty('access_token');
    });

    it('deve lançar erro se email já existe via local', async () => {
        jest.spyOn(usersService, 'findByGoogleId').mockResolvedValue(null);
        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(mockUser as any);
        
        await expect(service.googleLogin({ googleId: 'g1', email: 'test@example.com' })).rejects.toThrow(BadRequestException);
    });

    it('deve retornar dados temporários se usuário novo', async () => {
        jest.spyOn(usersService, 'findByGoogleId').mockResolvedValue(null);
        jest.spyOn(usersService, 'findByEmail').mockResolvedValue(null);
        
        const result = await service.googleLogin({ googleId: 'g1', email: 'new@g.com' });
        expect(result).toHaveProperty('needsCity', true);
    });
  });

  describe('completeGoogleRegistration', () => {
    it('deve registrar e retornar token', async () => {
        jest.spyOn(jwtService, 'verify').mockReturnValue({ googleUser: { email: 'e' } });
        jest.spyOn(usersService, 'create').mockResolvedValue(mockUser as any);

        const result = await service.completeGoogleRegistration('token', 'City');
        expect(result).toHaveProperty('access_token');
    });

    it('deve lançar erro se token inválido', async () => {
        jest.spyOn(jwtService, 'verify').mockImplementation(() => { throw new Error() });
        await expect(service.completeGoogleRegistration('bad', 'c')).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('forgotPassword', () => {
      it('deve enviar email com token', async () => {
          jest.spyOn(usersService, 'setResetPasswordToken').mockResolvedValue({ token: 't', user: mockUser as any });
          
          await service.forgotPassword({ email: 'e' });
          expect(mailerService.sendMail).toHaveBeenCalled();
      });

      it('não deve estourar erro se usuário não encontrado', async () => {
        jest.spyOn(usersService, 'setResetPasswordToken').mockRejectedValue(new NotFoundException());
        await expect(service.forgotPassword({ email: 'e' })).resolves.not.toThrow();
      });
  });

  describe('resetPassword', () => {
      it('deve chamar usersService.resetPassword', async () => {
          await service.resetPassword({ token: 't', newPassword: 'p' });
          expect(usersService.resetPassword).toHaveBeenCalled();
      });
  });
});
