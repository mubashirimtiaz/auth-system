import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { StrategyRequestHandler } from 'src/common/interfaces';
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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: StrategyRequestHandler) {
    return ApiSuccessResponse<Partial<User>>(
      true,
      MESSAGE.user.success.USER_FOUND,
      req.user,
    );
  }

  @Post('update-profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: StrategyRequestHandler,
    @Body() body: UpdateProfileDTO,
  ) {
    return this.userService.updateProfile(body, req.user);
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  updatePassword(
    @Request() req: StrategyRequestHandler,
    @Body() body: UpdatePasswordDTO,
  ) {
    return this.userService.updatePassword(body, req.user);
  }
  @Post('forget-password')
  forgetPassword(@Body() { email }: ForgetPasswordDTO) {
    return this.userService.forgetPassword({ email });
  }
  @Get('forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  getForgetPassword(@Request() req: StrategyRequestHandler) {
    return ApiSuccessResponse<Partial<User>>(
      true,
      MESSAGE.user.success.USER_FOUND,
      req.user,
    );
  }

  @Post('forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  updateForgetPassword(
    @Request() req: StrategyRequestHandler,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, req.user);
  }

  @Get('verify-email')
  @UseInterceptors(VerifyEmailInterceptor)
  verifyEmail(@Request() req: StrategyRequestHandler) {
    return this.userService.verifyEmail(req.user);
  }
}
