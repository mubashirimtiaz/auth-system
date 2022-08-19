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
import { UpdateProfileDTO } from './dto/user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: StrategyRequestHandler) {
    return req.user;
  }

  @Post('update')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Request() req: StrategyRequestHandler,
    @Body() body: UpdateProfileDTO,
  ) {
    return this.userService.updateProfile(body, req.user);
  }
}
