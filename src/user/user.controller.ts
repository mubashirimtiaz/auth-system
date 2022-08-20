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
import { getRequiredProperties } from 'src/common/functions';
import {
  ForgetPasswordDTO,
  UpdateForgetPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from './dto/user.dto';
import { ForgetPasswordInterceptor } from './interceptor/user.interceptor';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: StrategyRequestHandler) {
    return getRequiredProperties(req.user, ['hash']);
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
  @Get(':id/forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  getForgetPassword(@Request() req: StrategyRequestHandler) {
    return getRequiredProperties(req.user, ['hash']);
  }

  @Post(':id/forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  async updateForgetPassword(
    @Request() req: StrategyRequestHandler,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, req.user);
  }
}
