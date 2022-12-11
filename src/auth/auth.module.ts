import { ClassSerializerInterceptor, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MailModule } from 'src/mail/mail.module';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  providers: [
    AuthService,
    LocalStrategy,
    JwtStrategy,
    JwtRefreshStrategy,
    GoogleStrategy,
    { provide: APP_INTERCEPTOR, useClass: ClassSerializerInterceptor },
  ],
  imports: [PrismaModule, PassportModule, JwtModule, MailModule],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
