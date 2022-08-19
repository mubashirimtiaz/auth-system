import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth_guards/jwt-auth.guard';
import { StrategyRequestHandler } from 'src/interfaces/global.interface';

@Controller('user')
export class UserController {
  @Get('me')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req: StrategyRequestHandler) {
    return req.user;
  }
}
