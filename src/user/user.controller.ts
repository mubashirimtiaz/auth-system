import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/auth_guards/jwt-auth.guard';

@Controller()
export class UserController {
  @Get('profile')
  @UseGuards(JwtAuthGuard)
  getProfile(@Request() req) {
    console.log(req.user);

    return req.user;
  }
}
