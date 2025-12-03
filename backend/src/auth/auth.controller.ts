import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Req,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {}

  @Public()
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
  @Get('google')
  @UseGuards(GoogleAuthGuard)
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(GoogleAuthGuard)
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
  async completeGoogleRegistration(
    @Body() body: { tempToken: string; city: string },
  ) {
    return this.authService.completeGoogleRegistration(
      body.tempToken,
      body.city,
    );
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: any) {
    return { user };
  }

  @Get('test')
  async test(@CurrentUser() user: any) {
    return {
      message: 'Rota protegida funcionando!',
      user,
    };
  }
}
