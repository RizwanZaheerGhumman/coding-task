import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UserService } from './user.service';
import { ResponseData } from '../../types/response-type';

@ApiBearerAuth()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get all users' })
  async findOne(
    @Res() res,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ResponseData> {
    const response: ResponseData = await this.userService.findOne(id);
    return res.status(response.status).json(response.content);
  }
}
