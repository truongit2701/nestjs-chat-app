import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './utils/filters/http-exception.filter';
import { join } from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as express from 'express';

process.env.TZ = "Asia/Ho_Chi_Minh";
async function bootstrap() {

  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const uploadPath = process.env.NODE_ENV === 'production'
    ? join(__dirname, '..', 'uploads')
    : join(__dirname, '..', '..', 'uploads');
  app.use('/uploads', express.static(uploadPath));

  app.enableCors();
  app.setGlobalPrefix('/api')
  app.useGlobalFilters(new HttpExceptionFilter());
  await app.listen(process.env.CONFIG_PORT);
  console.log(`app is running on ${await app.getUrl()}`);
}
bootstrap();