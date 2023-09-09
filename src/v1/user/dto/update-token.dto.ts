import { IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateTokenDto {
  @ApiProperty()
  @IsOptional()
  @IsString()
  hashedRefreshToken?: string;

  @ApiProperty()
  @IsOptional()
  @IsString()
  refreshToken?: string;
}
