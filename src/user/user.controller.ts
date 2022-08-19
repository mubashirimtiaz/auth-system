import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth_guards/jwt-auth.guard';
import { StrategyRequestHandler } from 'src/interfaces/global.interface';
import { UpdatePasswordDTO, UpdateProfileDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: StrategyRequestHandler) {
    return req.user;
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
}
