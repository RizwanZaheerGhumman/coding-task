import { DataSource, DataSourceOptions } from 'typeorm';
import 'reflect-metadata';
import * as dotenv from 'dotenv';

dotenv.config();
export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
  username: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  ssl: process.env.DATABASE_SSL === 'true',
  entities: ['dist/**/*.entity.js'],
  synchronize: false,
  dropSchema: false,
  logging: false,
  subscribers: [],
  migrations: ['dist/src/migrations/*.js'],
};
const database = new DataSource(dataSourceOptions);
export default database;
