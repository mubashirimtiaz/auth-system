import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { ConfigModule } from '@nestjs/config';
import { MailService } from './mail/mail.service';
import { MailModule } from './mail/mail.module';
import { OpenaiModule } from './openai/openai.module';
import configuration from 'config/configuration';
import { ThrottlerModule } from '@nestjs/throttler';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    ThrottlerModule.forRoot({
      ttl: 60,
      limit: 10,
    }),
    AuthModule,
    UserModule,
    PrismaModule,
    MailModule,
    OpenaiModule,
  ],
  controllers: [AppController],
  providers: [AppService, MailService],
})
export class AppModule {}

// export class AppModule implements NestModule {
//   configure(consumer: MiddlewareConsumer) {
//     consumer
//       .apply(VerifySignatureMiddleware)
//       .exclude('(.*)/auth/(.*)/redirect')
//       .forRoutes(AuthController, UserController, OrganizationController);
//   }
// }
