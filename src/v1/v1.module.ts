import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import * as configDotenv from 'dotenv';
import { dataSourceOptions } from '../config/db/database';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessTokenStrategy } from './auth/strategy/jwt-strategy.service';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './auth/strategy/jwt-auth-guard';

configDotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    UserModule,
    PassportModule.register({ defaultStrategy: ['jwt'] }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    JwtAccessTokenStrategy,
  ],
})
export class V1Module {}
