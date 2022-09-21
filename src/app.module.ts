import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AwsModule } from './aws/aws.module';
import { ConfigModule } from '@nestjs/config';
import { OrganizationModule } from './organization/organization.module';
import { MqttModule } from './mqtt/mqtt.module';
import configuration from 'config/configuration';
import { VerifySignatureMiddleware } from './common/middlewares';
import { AuthController } from './auth/auth.controller';
import { UserController } from './user/user.controller';
import { OrganizationController } from './organization/organization.controller';
import { ServiceModule } from './service/service.module';
import { ServiceController } from './service/service.controller';
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    PrismaModule,
    AwsModule,
    OrganizationModule,
    MqttModule,
    ServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(VerifySignatureMiddleware)
      .exclude('(.*)/auth/(.*)/redirect')
      .forRoutes(
        AuthController,
        UserController,
        OrganizationController,
        ServiceController,
      );
  }
}
