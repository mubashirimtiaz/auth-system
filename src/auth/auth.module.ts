import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { JwtForgetPasswordStrategy } from './strategies/forget-password.strategy';
import { AwsModule } from 'src/aws/aws.module';
import { GithubStrategy } from './strategies/github-strategy';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    GoogleStrategy,
    JwtRefreshStrategy,
    JwtForgetPasswordStrategy,
    GithubStrategy,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
  imports: [PrismaModule, PassportModule, JwtModule, AwsModule],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
