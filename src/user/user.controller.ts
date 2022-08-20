import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtForgetPasswordGuard } from 'src/auth/auth_guards/forget-password-auth.guard';
import { JwtAuthGuard } from 'src/auth/auth_guards/jwt-auth.guard';
import { StrategyRequestHandler } from 'src/interfaces/global.interface';
import { getRequiredProperties } from 'src/utils/functions';
import {
  ForgetPasswordDTO,
  UpdateForgetPasswordDTO,
  UpdatePasswordDTO,
  UpdateProfileDTO,
} from './dto/user.dto';
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
  @UseGuards(JwtForgetPasswordGuard)
  getForgetPassword(@Request() req: StrategyRequestHandler) {
    return getRequiredProperties(req.user, ['hash']);
  }

  @Post(':id/forget-password')
  @UseGuards(JwtForgetPasswordGuard)
  async updateForgetPassword(
    @Request() req: StrategyRequestHandler,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, req.user);
  }
}
