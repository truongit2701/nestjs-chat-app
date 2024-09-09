import { Body, Controller, Get, HttpStatus, Param, Post, Request } from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { BaseResponse } from 'src/utils/response/base-api.response';

@Controller('conversation')
export class ConversationController {
   constructor(private readonly conversationService: ConversationService) { }

   @Post()
   async create(@Request() req, @Body() createConversationDto: { name: string; participantIds: number[] }) {
      const data = await this.conversationService.create(req.user, createConversationDto.name, createConversationDto.participantIds);
      return new BaseResponse({ data });
   }

   @Get()
   async findAll(@Request() req: any) {
      return new BaseResponse({ data: await this.conversationService.findAll(req) });
   }

   @Get(':id')
   async findOne(@Param('id') id: string) {
      return new BaseResponse({ data: await this.conversationService.findOne(+id) });
   }
}
