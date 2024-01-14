/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.
import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { Express } from 'express';
import * as exphbs from 'express-handlebars';
import { join } from 'path';
import { enableDevCors } from 'shared/nestjs';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { TypeormExceptionFilter } from './filters/typeorm-exception.filter';

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

// eslint-disable-next-line no-explicit-any
const assign = (varName: string, varValue: unknown, options: any) => {
  if (!options.data.root) {
    options.data.root = {};
  }
  options.data.root[varName] = varValue;
};

(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(AppModule.forApp());

  app.useGlobalFilters(new TypeormExceptionFilter());

  (app.getHttpAdapter().getInstance() as Express).use(cookieParser());
  enableDevCors(app);
  app.setGlobalPrefix('v1');

  app.useStaticAssets(join(__dirname, '../../../html'));
  app.setBaseViewsDir(join(__dirname, '../../../public'));
  app.setViewEngine('handlebars');
  app.engine('handlebars', exphbs({ helpers: { assign } }));

  // NOTE: ValidationPipe/class-validator are NOT used because their handling
  // and capabilities are very limited compared to Joi/JoiPipe, especially
  // concerning automagic value transformation.

  const config = app.get<ConfigService>('ConfigService');
  const logService = app.get<LogService>(LOGGER);

  SwaggerModule.setup(
    '/api/docs',
    app,
    SwaggerModule.createDocument(
      app,
      new DocumentBuilder()
        .setTitle('user service')
        .setDescription('API documentation of the user service')
        .setVersion('3.0')
        .addBearerAuth()
        .addTag('ACL', 'Authentication and Authorization.')
        .addTag('Users Administration', 'Fetch rights of users.')
        .addTag('Roles Administration', 'CRUD roles. grant/deny rights to resources.')
        .addTag('ACL Administration', 'CRUD rights.')
        .build(),
    ),
  );

  await app.listen(config.httpPort);
  logService.info(`Listening on port ${config.httpPort}`);
})().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});
