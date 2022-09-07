import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { User } from 'src/common/interfaces';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenDTO, SignInDTO, SignUpDTO } from './dto/auth.dto';
import DECORATORS from 'src/common/decorators';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async login(
    @DECORATORS.user.params.Payload() user: User,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  @Get('github')
  @UseGuards(GithubAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async githubAuth(@DECORATORS.user.params.Payload() user: User) {}

  @Get('github/redirect')
  @UseGuards(GithubAuthGuard)
  githubAuthRedirect(@DECORATORS.user.params.Payload() user: User) {
    return this.authService.login(user);
  }

  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async microsoftAuth(@DECORATORS.user.params.Payload() user: User) {}

  @Get('microsoft/redirect')
  @UseGuards(MicrosoftAuthGuard)
  microsoftAuthRedirect(@DECORATORS.user.params.Payload() user: User) {
    return this.authService.login(user);
  }
}
