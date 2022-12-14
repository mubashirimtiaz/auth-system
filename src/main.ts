import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { validationPipeException } from './common/functions';
import { TransformResInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('/v1/api');
  app.useGlobalInterceptors(new TransformResInterceptor());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: validationPipeException,
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  const config = new DocumentBuilder()
    .setTitle('AUTH SYSTEM API')
    .setDescription('AUTH SYSTEM API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/v1/api', app, document);

  await app.listen(3000);
}
bootstrap();
