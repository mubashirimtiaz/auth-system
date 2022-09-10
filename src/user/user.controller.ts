import {
  Body,
  Controller,
  Get,
  Param,
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
import { ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { MongoIdDTO } from 'src/common/dtos';

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

  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @ApiParam({ name: 'id', required: true })
  @Get(':id/forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  getForgetPassword(
    @DECORATOR.params.Payload() user: User,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param() _: MongoIdDTO,
  ) {
    return ApiSuccessResponse<Partial<User>>(
      true,
      MESSAGE.user.success.USER_FOUND,
      user,
    );
  }
  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @ApiParam({ name: 'id', required: true })
  @Post(':id/forget-password')
  @UseInterceptors(ForgetPasswordInterceptor)
  updateForgetPassword(
    @DECORATOR.params.Payload() user: User,
    @Body() { newPassword }: UpdateForgetPasswordDTO,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @Param() _: MongoIdDTO,
  ) {
    return this.userService.updateForgetPassword({ newPassword }, user);
  }

  @ApiQuery({ name: 'token', required: true })
  @ApiQuery({ name: 'code', required: true })
  @ApiParam({ name: 'id', required: true })
  @Get(':id/verify-email')
  @UseInterceptors(VerifyEmailInterceptor)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  verifyEmail(@DECORATOR.params.Payload() user: User, @Param() _: MongoIdDTO) {
    return this.userService.verifyEmail(user);
  }
}
