import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { ResponseData } from '../../types/response-type';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import * as bcryptjs from 'bcryptjs';
import { CreateUserDto } from '../user/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async login(body: LoginUserDto): Promise<ResponseData> {
    try {
      const res: ResponseData = await this.userService.findUserByEmail(
        body.email,
      );
      if (res.status === HttpStatus.NOT_FOUND) {
        return res;
      }
      const user: User = res.content as User;
      const isValid: boolean = bcryptjs.compareSync(
        body.password,
        user.password,
      );
      if (isValid) {
        const accessToken: string = await this.getAccessToken(
          user.id,
          user.email,
        );
        return {
          status: HttpStatus.OK,
          content: {
            jwt: accessToken,
          },
        };
      } else {
        return {
          status: HttpStatus.UNAUTHORIZED,
          content: { message: 'Invalid password' },
        };
      }
    } catch (err) {
      throw new HttpException({ message: err.message }, HttpStatus.BAD_REQUEST);
    }
  }

  async register(body: CreateUserDto): Promise<ResponseData> {
    try {
      return await this.userService.create(body);
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // async me(req: any): Promise<ResponseData> {
  //   try {
  //     return await this.userService.meRequestData(req.user.id);
  //   } catch (err) {
  //     throw new HttpException({ message: err.message }, HttpStatus.BAD_REQUEST);
  //   }
  // }

  async getAccessToken(userId: number, email: string): Promise<string> {
    try {
      return await this.jwtService.signAsync(
        {
          id: userId,
          email,
        },
        {
          privateKey: process.env.PRIVATE_KEY,
          expiresIn: process.env.ACCESS_TOKEN_EXPIRE_DURATION,
          algorithm: 'RS512',
        },
      );
    } catch (err) {
      throw new HttpException({ message: err.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
