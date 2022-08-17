import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth_guards/jwt-auth.guard';
import { StrategyRequestHandler } from 'src/interfaces/auth/auth.global.interface';

@Controller()
export class UserController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: StrategyRequestHandler) {
    return req.user;
  }
}
