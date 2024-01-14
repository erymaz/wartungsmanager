/* eslint-disable no-console */ // We don't have a logger available everywhere in this file.
import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { DocumentBuilder } from '@nestjs/swagger';
import { createAuthMiddleware, NestCoreLogger } from 'shared/nestjs';
import { addSwaggerModule } from 'shared/nestjs/api-docs';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

console.log(`${new Date().toISOString()} Starting up`);
console.log(
  `${new Date().toISOString()} NODE_ENV=${process.env.NODE_ENV}`,
  `LOG_LEVEL=${process.env.LOG_LEVEL}`,
);

async function bootstrap() {
  const app = await NestFactory.create(AppModule.forApp(), {
    cors: true,
    logger: new NestCoreLogger(),
  });

  const config = app.get('ConfigService') as ConfigService;
  const logService = app.get<LogService>(LOGGER);

  const options = new DocumentBuilder()
    .setTitle('shopfloor.io file service')
    .setVersion(process.env.npm_package_version || 'n/a')
    .build();

  addSwaggerModule(logService.createLogger('openapi'), app, options, {
    authEnabled: config.openApiDocs.auth.enabled,
    authUser: config.openApiDocs.auth.username,
    authPwd: config.openApiDocs.auth.password,
  });

  const httpPort = config.httpPort;

  app.use(createAuthMiddleware(app.get(HttpAdapterHost), config));

  await app.listen(httpPort);
  logService.info(`Listening on port ${httpPort}`);
}
bootstrap().catch(err => {
  console.error(`${new Date().toISOString()} Fatal error during startup`, err);
  process.exit(1);
});
