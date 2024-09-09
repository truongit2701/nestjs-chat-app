import { Body, Controller, Post, Req } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@Controller('comment')
export class CommentController {
  constructor(private readonly commentService: CommentService) { }

  @Post()
  create(@Req() req, @Body() createCommentDto: CreateCommentDto) {
    return this.commentService.create(createCommentDto, req.user.sub);
  }
}
