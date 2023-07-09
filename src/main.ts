import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { PrismaClientExceptionFilter } from './shared/filters/prisma.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();
  const config = new DocumentBuilder()
    .addBearerAuth()
    .setTitle('SCA_API')
    .setDescription('API definition for sca app')
    .setVersion('0.1')
    .addTag('sca')
    .build();
  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new PrismaClientExceptionFilter(httpAdapter));
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
  await app.listen(30125);
}
bootstrap();
