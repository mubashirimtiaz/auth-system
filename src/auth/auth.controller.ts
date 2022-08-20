import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { StrategyRequestHandler } from 'src/interfaces/global.interface';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './auth_guards/google-auth.guard';
import { JwtRefreshAuthGuard } from './auth_guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './auth_guards/local-auth.guard';
import { SignInDTO, SignUpDTO } from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async login(@Request() req: StrategyRequestHandler, @Body() _: SignInDTO) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() body: SignUpDTO) {
    return this.authService.signup(body);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refreshAccessToken(@Request() req: StrategyRequestHandler) {
    return this.authService.refreshAccessToken(req.user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async googleAuth(@Request() _: StrategyRequestHandler) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@Request() req: StrategyRequestHandler) {
    return this.authService.login(req.user);
  }
}
