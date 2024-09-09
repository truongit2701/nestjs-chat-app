import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { DataSource, Repository } from 'typeorm';
import { User } from 'src/user/user.entity';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private messageRepository: Repository<Message>,

    private dataSource: DataSource,
  ) { }


  async create(content: string, conversationId: number, userId: number) {
    const object = {
      conversation_id: conversationId,
      content,
      user_id: userId,
    }
    const data = this.messageRepository.create(object);

    return await this.messageRepository.save(data);
  }

  async findAll(conver_id: number) {
    return await this.dataSource
      .createQueryBuilder()
      .select('message')
      .from(Message, 'message')
      .leftJoinAndMapOne(
        'message.user',
        User,
        'user',
        'user.id = message.user_id'
      )
      .where('message.conversation_id = :id', { id: conver_id })
      .orderBy('message.created_at', 'ASC')
      .getMany();

  }

}
