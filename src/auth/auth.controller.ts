import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/common/interfaces';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenDTO, SignInDTO, SignUpDTO } from './dto/auth.dto';
import DECORATORS from 'src/common/decorators';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async login(
    @DECORATORS.user.params.Payload() user: User,
    @Body() _: SignInDTO,
  ) {
    return this.authService.login(user);
  }

  @Post('signup')
  async signup(@Body() body: SignUpDTO) {
    return this.authService.signup(body);
  }

  @Post('refresh')
  @UseGuards(JwtRefreshAuthGuard)
  refreshAccessToken(
    @DECORATORS.user.params.Payload() user: User,
    @Body() _: RefreshTokenDTO,
  ) {
    return this.authService.refreshAccessToken(user);
  }

  @Get('google')
  @UseGuards(GoogleAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async googleAuth(@DECORATORS.user.params.Payload() user: User) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  googleAuthRedirect(@DECORATORS.user.params.Payload() user: User) {
    return this.authService.login(user);
  }
}
