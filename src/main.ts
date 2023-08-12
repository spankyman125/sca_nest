import { ValidationPipe } from '@nestjs/common';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { json } from 'body-parser';
import * as compression from 'compression';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaClientExceptionFilter } from './shared/filters/prisma.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const { httpAdapter } = app.get(HttpAdapterHost);

  if (process.env.NODE_ENV === 'dev')
    app.useStaticAssets(join(__dirname, '..', '..', 'public'));
  app.setGlobalPrefix('api');
  app.enableCors();
  app.use(json({ limit: '50mb' }));
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  app.use(compression());
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('SCA_API')
    .setDescription('API definition for sca app')
    .setVersion('0.1')
    .addTag('sca')
    .build();
  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api/docs', app, document);
  await app.listen(30125);
}
bootstrap();
