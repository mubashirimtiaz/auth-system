import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JSON_SECRET_KEY,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [AuthService],
  controllers: [AuthController],
})
export class AuthModule {}
