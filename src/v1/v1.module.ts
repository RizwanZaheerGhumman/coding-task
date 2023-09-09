import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as configDotenv from 'dotenv';
import { dataSourceOptions } from '../config/db/database';

configDotenv.config();

@Module({
  imports: [TypeOrmModule.forRoot(dataSourceOptions)],
})
export class V1Module {}
