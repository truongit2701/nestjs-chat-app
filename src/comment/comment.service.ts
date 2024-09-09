import { Injectable } from '@nestjs/common';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Comment } from './entities/comment.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,


  ) { }

  async create(createCommentDto: CreateCommentDto, userId: number) {
    const newComment = this.commentRepository.create({
      ...createCommentDto,
      user_id: userId,
      post: { id: createCommentDto.post_id }
    });
    await this.commentRepository.save(newComment);
  }

}
