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
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('User')
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

  @Post('forget-password/send-email')
  forgetPassword(@Body() { email }: ForgetPasswordDTO) {
    return this.userService.forgetPassword({ email });
  }

  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @Post('forget-password/reset')
  @UseInterceptors(ForgetPasswordInterceptor)
  updateForgetPassword(
    @DECORATOR.params.Payload() user: User,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, user);
  }

  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @Get('verify')
  @UseInterceptors(VerifyEmailInterceptor)
  verifyEmail(@DECORATOR.params.Payload() user: User) {
    return this.userService.verifyEmail(user);
  }
}
