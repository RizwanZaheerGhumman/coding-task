import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { ResponseData } from '../../types/response-type';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './entities/task.entity';
import { Repository } from 'typeorm';

@Injectable()
export class TaskService {
  constructor(
    @InjectRepository(Task) private readonly taskRepository: Repository<Task>,
  ) {}

  async create(body: CreateTaskDto): Promise<ResponseData> {
    try {
      await this.taskRepository.save(body);
      return {
        status: HttpStatus.CREATED,
        content: {
          message: 'Task created successfully.',
        },
      };
    } catch (error) {
      if (error.message.includes('duplicate')) {
        return {
          status: HttpStatus.CONFLICT,
          content: {
            message: error.detail.includes('name') ? 'Task already exists' : '',
          },
        };
      }
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async findAll(): Promise<ResponseData> {
    try {
      const tasks: Task[] = await this.taskRepository.find({
        select: ['id', 'name'],
      });
      return {
        status: HttpStatus.OK,
        content: {
          tasks: tasks,
        },
      };
    } catch (error) {
      throw new HttpException(
        { message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
