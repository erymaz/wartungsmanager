import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { ConnectionOptions } from 'typeorm';
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

import { ConfigService } from './src/config/config.service';
import {ENTITIES_PATH, MIGRATION_PATH, MIGRATION_TABLE_NAME} from "./src/definitions";

const configService = new ConfigService;


// Don't forget to changes app.module.ts as well
const config: ConnectionOptions = {
  type: 'mysql',
  host: configService.database.host,
  ssl: configService.database.ssl,
  port: configService.database.port,
  username: configService.database.user,
  password: configService.database.pass,
  database: configService.database.name,
  migrationsTableName: MIGRATION_TABLE_NAME,
  migrations: [MIGRATION_PATH],
  migrationsRun: true,
  namingStrategy: new SnakeNamingStrategy(),
  entities: [ENTITIES_PATH],
  maxQueryExecutionTime: 5000,
};

export = config;
