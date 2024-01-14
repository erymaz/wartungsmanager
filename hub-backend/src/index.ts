/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.

import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { Express } from 'express';
import { createAuthMiddleware } from 'shared/nestjs';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

(async (): Promise<void> => {
  const app = await NestFactory.create(AppModule.forApp(), { cors: true });

  // NOTE: ValidationPipe/class-validator are NOT used because their handling
  // and capabilities are very limited compared to Joi/JoiPipe, especially
  // concerning automagic value transformation.

  const configService = app.get<ConfigService>('ConfigService');
  const logService = app.get<LogService>(LOGGER);
  (app.getHttpAdapter().getInstance() as Express).use(cookieParser());

  SwaggerModule.setup(
    '/api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('hub-backend')
        .setDescription('API documentation of all integrated modules')
        .setVersion('3.0')
        .build(),
    ),
  );

  app.use(createAuthMiddleware(app.get(HttpAdapterHost), configService));

  await app.listen(configService.httpPort);
  logService.info(`Listening on port ${configService.httpPort}`);
})().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});
