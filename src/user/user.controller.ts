import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ApiSuccessResponse } from 'src/common/functions';
import {
  ForgetPasswordDTO,
  UpdateForgetPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from './dto/user.dto';
import { ForgetPasswordInterceptor } from './interceptor/forget-password.interceptor';
import { UserService } from './user.service';
import { MESSAGE } from 'src/common/messages';
import { User } from './interface/user.interface';
import { VerifyEmailInterceptor } from './interceptor/verify-email.interceptor';
import { ApiBearerAuth, ApiHeader, ApiQuery, ApiTags } from '@nestjs/swagger';
import { DecodeJWTCodeInterceptor } from 'src/common/interceptors';
import DECORATORS from 'src/common/decorators';
import { JwtTOKEN } from 'src/common/interfaces';

@ApiTags('User')
@ApiHeader({
  name: 'x-signature-token',
})
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@DECORATORS.general.params.Payload('user') user: User) {
    return ApiSuccessResponse<Partial<User>>(
      true,
      MESSAGE.user.success.USER_FOUND,
      user,
    );
  }

  @ApiBearerAuth()
  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() body: UpdateProfileDTO,
  ) {
    return this.userService.updateProfile(body, user);
  }

  @ApiBearerAuth()
  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() body: UpdatePasswordDTO,
  ) {
    return this.userService.updatePassword(body, user);
  }

  @Post('forget-password/send-email')
  forgetPasswordEmailSend(@Body() { email }: ForgetPasswordDTO) {
    return this.userService.forgetPassword({ email });
  }

  @ApiQuery({ name: 'token', required: true })
  @Get('forget-password/resend-email')
  @UseInterceptors(DecodeJWTCodeInterceptor)
  forgetPasswordEmailResend(
    @DECORATORS.general.params.Payload('meta') payload: JwtTOKEN,
  ) {
    return this.userService.forgetPassword({ email: payload?.email });
  }

  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @Post('forget-password/reset')
  @UseInterceptors(ForgetPasswordInterceptor)
  updateForgetPassword(
    @DECORATORS.general.params.Payload('user') user: User,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, user);
  }

  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @Get('verify')
  @UseInterceptors(VerifyEmailInterceptor)
  verifyEmail(@DECORATORS.general.params.Payload('user') user: User) {
    return this.userService.verifyEmail(user);
  }

  @ApiQuery({ name: 'token', required: true })
  @Get('verify/resend-email')
  @UseInterceptors(DecodeJWTCodeInterceptor)
  verifyEmailResend(
    @DECORATORS.general.params.Payload('meta') payload: JwtTOKEN,
  ) {
    return this.userService.verifyEmailResend(payload);
  }
}
