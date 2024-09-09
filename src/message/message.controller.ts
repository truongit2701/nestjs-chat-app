import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { BaseResponse } from 'src/utils/response/base-api.response';

@Controller('message')
export class MessageController {
  constructor(private readonly messageService: MessageService) { }

  @Get("")
  async findAll(@Query('conver_id') conver_id: number) {
    const data = await this.messageService.findAll(conver_id);
    return new BaseResponse({ data });
  }

}
