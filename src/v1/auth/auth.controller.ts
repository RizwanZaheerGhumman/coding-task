import { Body, Controller, Post, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ResponseData } from '../../types/response-type';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { NoAuth } from './strategy/no-auth.guard';

@ApiBearerAuth()
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @NoAuth()
  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  async login(@Res() res, @Body() body: LoginUserDto): Promise<Response> {
    const response: ResponseData = await this.authService.login(body);
    return res.status(response.status).json(response.content);
  }

  @NoAuth()
  @Post('register')
  @ApiOperation({ summary: 'Register user' })
  async register(@Res() res, @Body() body: CreateUserDto): Promise<Response> {
    const response: ResponseData = await this.authService.register(body);
    return res.status(response.status).json(response.content);
  }
}
