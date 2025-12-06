import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  @ApiOperation({
    summary: 'Login com email e senha',
    description: 'Autentica usuário e retorna token JWT',
  })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login realizado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'João Silva',
          email: 'joao@example.com',
          city: 'São Paulo',
          role: 'user',
          provider: 'local',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Credenciais inválidas' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  @ApiOperation({
    summary: 'Registrar novo usuário',
    description:
      'Cria novo usuário e automaticamente inicia coleta de dados climáticos para a cidade informada',
  })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({
    status: 201,
    description: 'Usuário criado com sucesso',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        user: {
          id: '507f1f77bcf86cd799439011',
          name: 'João Silva',
          email: 'joao@example.com',
          city: 'São Paulo',
          role: 'user',
          provider: 'local',
        },
      },
    },
  })
  @ApiResponse({ status: 409, description: 'Email já cadastrado' })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Iniciar login com Google',
    description: 'Redireciona para página de autenticação do Google',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para Google OAuth',
  })
  async googleAuth() {
    // Redireciona para Google
  }

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
  @ApiOperation({
    summary: 'Callback do Google OAuth',
    description: 'Processa retorno da autenticação Google',
  })
  @ApiResponse({
    status: 302,
    description: 'Redirecionamento para frontend com token',
  })
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.googleLogin(req.user);

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    if ('needsCity' in result && result.needsCity) {
      return res.redirect(
        `${frontendUrl}/complete-registration?token=${result.tempToken}&name=${encodeURIComponent(result.user.name)}&email=${encodeURIComponent(result.user.email)}`,
      );
    }

    return res.redirect(
      `${frontendUrl}/auth/callback?token=${(result as any).access_token}`,
    );
  }

  @Public()
  @Post('google/complete')
  @ApiOperation({
    summary: 'Completar registro Google',
    description: 'Finaliza registro de usuário Google informando a cidade',
  })
  @ApiBody({
    schema: {
      example: {
        tempToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
        city: 'São Paulo',
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Registro Google completado com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Token temporário inválido' })
  async completeGoogleRegistration(
    @Body() body: { tempToken: string; city: string },
  ) {
    return this.authService.completeGoogleRegistration(
      body.tempToken,
      body.city,
    );
  }

  @Get('profile')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Obter perfil do usuário logado',
    description: 'Retorna dados do usuário autenticado',
  })
  @ApiResponse({
    status: 200,
    description: 'Perfil do usuário',
    schema: {
      example: {
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'joao@example.com',
          name: 'João Silva',
          role: 'user',
          city: 'São Paulo',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Não autenticado' })
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }

  @Get('test')
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Testar autenticação',
    description: 'Endpoint para verificar se token JWT é válido',
  })
  @ApiResponse({
    status: 200,
    description: 'Token válido',
    schema: {
      example: {
        message: 'Rota protegida funcionando!',
        user: {
          id: '507f1f77bcf86cd799439011',
          email: 'joao@example.com',
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Token inválido ou ausente' })
  async test(@CurrentUser() user: any) {
    return {
      message: 'Rota protegida funcionando!',
      user,
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Solicitar recuperação de senha',
    description: 'Envia email com link para redefinir senha',
  })
  @ApiResponse({
    status: 200,
    description: 'Email enviado (se o email existir)',
    schema: {
      example: {
        message:
          'Se o email existir, você receberá instruções para resetar a senha',
      },
    },
  })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    await this.authService.forgotPassword(forgotPasswordDto);
    return {
      message:
        'Se o email existir, você receberá instruções para resetar a senha',
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Redefinir senha',
    description: 'Cria nova senha usando token do email',
  })
  @ApiResponse({
    status: 200,
    description: 'Senha resetada com sucesso',
    schema: {
      example: {
        message: 'Senha redefinida com sucesso! Você já pode fazer login',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Token inválido ou expirado',
  })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto);
    return {
      message: 'Senha redefinida com sucesso! Você já pode fazer login',
    };
  }
}
