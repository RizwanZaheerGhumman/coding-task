import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  employeeNo: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  password: string;
}
