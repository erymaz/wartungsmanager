import { INestApplication } from '@nestjs/common';

export function enableDevCors(app: INestApplication): void {
  console.warn('CORS for DEV enabled');
  app.enableCors({
    origin: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
}
