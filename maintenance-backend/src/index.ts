import { LogService } from '@elunic/logger';
import { LOGGER } from '@elunic/logger-nestjs';
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { createAuthMiddleware } from 'shared/nestjs';

import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const options = new DocumentBuilder()
    .setTitle('Maintenance manager')
    .setDescription('Maintenance manager API')
    .setVersion('0.1')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api/docs', app, document);

  const config = app.get('ConfigService') as ConfigService;
  const logService = app.get<LogService>(LOGGER);

  app.enableCors();
  app.use(createAuthMiddleware(app.get(HttpAdapterHost), config));

  await app.listen(config.httpPort);
  logService.info(`Listening on port ${config.httpPort}`);
}
bootstrap();
