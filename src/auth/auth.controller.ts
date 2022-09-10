import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Post,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { Response } from 'express';
import { User } from 'src/common/interfaces';
import { AuthService } from './auth.service';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenDTO, SignInDTO, SignUpDTO } from './dto/auth.dto';
import DECORATORS from 'src/common/decorators';
import { GithubAuthGuard } from './guards/github-auth.guard';
import { MicrosoftAuthGuard } from './guards/microsoft-auth.guard';
import { VerifyOauthTokenInterceptor } from './interceptor/verify-oauth-token.interceptor';
import { ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('Auth')
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

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async googleAuth(@DECORATORS.user.params.Payload() user: User) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @DECORATORS.user.params.Payload() user: User,
    @Res() res: Response,
  ) {
    const link = this.authService.oauthRedirect(user);
    res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
  }

  @Get('github')
  @UseGuards(GithubAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async githubAuth(@DECORATORS.user.params.Payload() user: User) {}

  @Get('github/redirect')
  @UseGuards(GithubAuthGuard)
  githubAuthRedirect(
    @DECORATORS.user.params.Payload() user: User,
    @Res() res: Response,
  ) {
    const link = this.authService.oauthRedirect(user);
    res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
  }

  @Get('microsoft')
  @UseGuards(MicrosoftAuthGuard)
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async microsoftAuth(@DECORATORS.user.params.Payload() user: User) {}

  @Get('microsoft/redirect')
  @UseGuards(MicrosoftAuthGuard)
  microsoftAuthRedirect(
    @DECORATORS.user.params.Payload() user: User,
    @Res() res: Response,
  ) {
    const link = this.authService.oauthRedirect(user);
    res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
  }
  @ApiQuery({ name: 'code', required: true })
  @Get('verify-oauth-code')
  @UseInterceptors(VerifyOauthTokenInterceptor)
  async verifyOauthCode(@DECORATORS.user.params.Payload() user: User) {
    return this.authService.login(user);
  }
}
