import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcryptjs from 'bcryptjs';
import { ResponseData } from '../../types/response-type';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async create(body: CreateUserDto): Promise<ResponseData> {
    try {
      const createUserInstance: User = this.userRepository.create({
        ...body,
        password: bcryptjs.hashSync(body.password),
      });
      const newUser: User = await this.userRepository.save(createUserInstance);
      return {
        status: HttpStatus.CREATED,
        content: {
          user: {
            id: newUser.id,
            email: newUser.email,
          },
        },
      };
    } catch (error) {
      if (error.message.includes('duplicate')) {
        return {
          status: HttpStatus.CONFLICT,
          content: {
            message: error.detail.includes('email')
              ? 'Email already exists'
              : '',
          },
        };
      }
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findOne(id: number): Promise<ResponseData> {
    try {
      const user: User = await this.userRepository.findOne({
        where: { id },
      });
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          content: {
            message: 'User not found.',
          },
        };
      }
      return {
        status: HttpStatus.OK,
        content: {
          user: {
            id: user.id,
            email: user.email,
          },
        },
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user: User = await this.userRepository.findOne({
        where: { email },
      });
      if (!user) {
        return {
          status: HttpStatus.NOT_FOUND,
          content: {
            message: 'User not found.',
          },
        };
      }
      return {
        status: HttpStatus.OK,
        content: user,
      };
    } catch (e) {
      throw new HttpException({ message: e.message }, HttpStatus.BAD_REQUEST);
    }
  }
}
