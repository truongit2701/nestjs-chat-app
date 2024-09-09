import { Controller, Get, Post, Body, Patch, Param, Delete, Req } from '@nestjs/common';
import { PostService } from './post.service';
import Request from 'express'
import { BaseResponse } from 'src/utils/response/base-api.response';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) { }

  @Post()
  create(@Req() req: any, @Body() createPostDto: { content: string, image: string }) {
    this.postService.create({
      ...createPostDto,
      user_id: req.user.sub
    });

    return new BaseResponse({ data: null })
  }

  @Get()
  async findAll() {
    return new BaseResponse({ data: await this.postService.findAll() })
  }

  @Post(':id/like')
  async likePost(@Param('id') id: number, @Req() req: any) {
    return new BaseResponse({ data: await this.postService.likePost(req.user.sub, id) })
  }

}
