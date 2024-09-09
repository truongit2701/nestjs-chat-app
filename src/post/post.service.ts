import { Injectable } from '@nestjs/common';
import { Post } from './post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class PostService {
  constructor(
    @InjectRepository(Post)
    private postRepository: Repository<Post>,

    private dataSource: DataSource

  ) { }


  async create(createPostDto: any) {
    const newPost = this.postRepository.create(createPostDto);
    await this.postRepository.save(newPost);
  }

  async likePost(userId: number, postId: number) {
    const post = await this.postRepository.findOne({ where: { id: postId } });

    let likeTotal = post.like_total || [];

    if (!likeTotal.includes(userId)) {
      likeTotal.push(userId);
    } else {
      likeTotal = likeTotal.filter(id => id !== userId);
    }

    await this.postRepository.update(
      { id: postId },
      { like_total: likeTotal }
    );

    return likeTotal;
  }

  async findAll() {
    return await this.dataSource
      .createQueryBuilder()
      .select('post')
      .from(Post, 'post')
      .leftJoinAndMapOne(
        'post.user',
        User,
        'user',
        'user.id = post.user_id'
      )
      .leftJoinAndSelect('post.comments', 'comments')
      .leftJoinAndMapOne(
        'comments.user',
        User,
        'commentUser',
        'commentUser.id = comments.user_id'
      )
      .addOrderBy('post.created_at', 'DESC')
      .getMany();
  }
}
