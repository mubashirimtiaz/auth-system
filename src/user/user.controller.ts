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
import DECORATOR from './decorator/user.decorator';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @ApiBearerAuth()
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@DECORATOR.params.Payload() user: User) {
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
    @DECORATOR.params.Payload() user: User,
    @Body() body: UpdateProfileDTO,
  ) {
    return this.userService.updateProfile(body, user);
  }

  @ApiBearerAuth()
  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @DECORATOR.params.Payload() user: User,
    @Body() body: UpdatePasswordDTO,
  ) {
    return this.userService.updatePassword(body, user);
  }

  @Post('forget-password')
  forgetPassword(@Body() { email }: ForgetPasswordDTO) {
    return this.userService.forgetPassword({ email });
  }
  @Get(':id/forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  getForgetPassword(@DECORATOR.params.Payload() user: User) {
    return ApiSuccessResponse<Partial<User>>(
      true,
      MESSAGE.user.success.USER_FOUND,
      user,
    );
  }

  @Post(':id/forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  updateForgetPassword(
    @DECORATOR.params.Payload() user: User,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, user);
  }

  @Get('verify-email')
  @UseInterceptors(VerifyEmailInterceptor)
  verifyEmail(@DECORATOR.params.Payload() user: User) {
    return this.userService.verifyEmail(user);
  }
}
