import { Body, Controller, Get, HttpStatus, Post, Req, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { BaseResponse } from 'src/utils/response/base-api.response';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async findAll(@Request() req: any) {
    return new BaseResponse({ data: await this.userService.findAll(req.user.sub) })
  }

  @Post(':id/update-avatar')
  async updateAvatar(@Body() body: { avatar: string }, @Request() req: any) {
    return new BaseResponse({ data: await this.userService.updateAvatar(req.user.sub, body.avatar) })
  }
}
