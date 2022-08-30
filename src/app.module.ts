import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { AwsModule } from './aws/aws.module';

@Module({
  imports: [PrismaModule, AuthModule, UserModule, PrismaModule, AwsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
