import { Body, Controller, Get, Post, Res } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ResponseData } from '../../types/response-type';

@ApiBearerAuth()
@ApiTags('Task')
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  async create(@Body() body: CreateTaskDto, @Res() res): Promise<ResponseData> {
    const response: ResponseData = await this.taskService.create(body);
    return res.status(response.status).json(response.content);
  }

  @Get()
  async findAll(@Res() res): Promise<ResponseData> {
    const response: ResponseData = await this.taskService.findAll();
    return res.status(response.status).json(response.content);
  }
}
