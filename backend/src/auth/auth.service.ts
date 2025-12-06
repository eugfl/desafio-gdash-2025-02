import {
  Injectable,
  UnauthorizedException,
  Logger,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private httpService: HttpService,
    private configService: ConfigService,
    private mailerService: MailerService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.provider !== 'local' || !user.password) {
      throw new UnauthorizedException(
        `Este email está vinculado ao login com ${user.provider}`,
      );
    }

    const isValidPassword = await this.usersService.validatePassword(
      user,
      loginDto.password,
    );

    if (!isValidPassword) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    await this.startCollectorForCity(user.city);

    return this.generateToken(user);
  }

  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create({
      ...registerDto,
      provider: 'local',
    });

    await this.startCollectorForCity(registerDto.city);

    return this.generateToken(user);
  }

  async googleLogin(googleUser: any) {
    const user = await this.usersService.findByGoogleId(googleUser.googleId);

    if (user) {
      this.logger.log(`Google login: ${user.email}`);

      await this.startCollectorForCity(user.city);

      return this.generateToken(user);
    }

    const existingUser = await this.usersService.findByEmail(googleUser.email);
    if (existingUser) {
      throw new BadRequestException(
        'Este email já está cadastrado. Use login com email/senha.',
      );
    }

    return {
      needsCity: true,
      tempToken: this.jwtService.sign({ googleUser }, { expiresIn: 600 }),
      user: {
        name: googleUser.name,
        email: googleUser.email,
        picture: googleUser.picture,
      },
    };
  }

  async completeGoogleRegistration(tempToken: string, city: string) {
    try {
      const decoded = this.jwtService.verify(tempToken);
      const googleUser = decoded.googleUser;

      const user = await this.usersService.create({
        name: googleUser.name,
        email: googleUser.email,
        city,
        provider: 'google',
        googleId: googleUser.googleId,
        picture: googleUser.picture,
      });

      await this.startCollectorForCity(city);

      return this.generateToken(user);
    } catch (error) {
      throw new UnauthorizedException('Token temporário inválido ou expirado');
    }
  }

  private async startCollectorForCity(city: string): Promise<void> {
    const collectorUrl = this.configService.get<string>('COLLECTOR_URL');

    try {
      await firstValueFrom(
        this.httpService.post(
          `${collectorUrl}/city`,
          { city },
          { timeout: 5000 },
        ),
      );
      this.logger.log(`✅ Coleta iniciada/atualizada para cidade: ${city}`);
    } catch (error) {
      this.logger.warn(
        `⚠️ Falha ao iniciar coleta no Collector: ${error.message}`,
      );
    }
  }

  private generateToken(user: any) {
    const payload = {
      sub: user._id.toString(),
      email: user.email,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        city: user.city,
        role: user.role,
        picture: user.picture,
        provider: user.provider,
      },
    };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    try {
      const { token, user } = await this.usersService.setResetPasswordToken(
        forgotPasswordDto.email,
      );

      const frontendUrl = this.configService.get<string>('FRONTEND_URL');
      const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

      await this.mailerService.sendMail({
        to: user.email,
        subject: '🔐 Recuperação de Senha - GDash',
        template: 'reset-password',
        context: {
          name: user.name,
          resetUrl,
        },
      });

      this.logger.log(`✉️ Email de recuperação enviado para: ${user.email}`);
    } catch (error) {
      if (error instanceof NotFoundException) {
        this.logger.warn(
          `Tentativa de reset para email inexistente: ${forgotPasswordDto.email}`,
        );
        return;
      }
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<void> {
    await this.usersService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword,
    );
    this.logger.log('✅ Senha resetada com sucesso');
  }
}
