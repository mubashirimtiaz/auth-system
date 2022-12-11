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
import { User } from 'src/common/interfaces';
import { AuthService } from './auth.service';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RefreshTokenDTO, SignInDTO, SignUpDTO } from './dto/auth.dto';
import DECORATORS from 'src/common/decorators';
import { ApiQuery, ApiTags } from '@nestjs/swagger';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { Response } from 'express';
import { VerifyOauthTokenInterceptor } from './interceptor/verify-oauth-token.interceptor';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signin')
  @UseGuards(LocalAuthGuard)
  async login(
    @DECORATORS.general.params.Payload('user') user: User,
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
    @DECORATORS.general.params.Payload('user') user: User,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Body() _: RefreshTokenDTO,
  ) {
    return this.authService.refreshAccessToken(user);
  }

  @UseGuards(GoogleAuthGuard)
  @Get('google')
  // eslint-disable-next-line @typescript-eslint/no-empty-function, @typescript-eslint/no-unused-vars
  async googleAuth(@DECORATORS.general.params.Payload('user') user: User) {}

  @Get('google/redirect')
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @DECORATORS.general.params.Payload('user') user: User,
    @Res() res: Response,
  ) {
    const link = this.authService.oauthRedirect(user);
    res.status(HttpStatus.MOVED_PERMANENTLY).redirect(link);
  }

  @ApiQuery({ name: 'code', required: true })
  @Get('verify-oauth-code')
  @UseInterceptors(VerifyOauthTokenInterceptor)
  async verifyOauthCode(@DECORATORS.general.params.Payload('user') user: User) {
    return this.authService.login(user);
  }
}
