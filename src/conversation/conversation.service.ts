import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Redis } from 'ioredis';
import { User } from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { Conversation } from './conversation.entity';
import { WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server } from 'http';

@Injectable()
@WebSocketGateway({ cors: { origin: '*' } })
export class ConversationService {
   @WebSocketServer() server: Server;

   constructor(
      @InjectRepository(Conversation)
      private conversationRepository: Repository<Conversation>,

      @InjectRepository(User)
      private readonly userRepository: Repository<User>,

      private dataSource: DataSource,

      @InjectRedis() private readonly cache: Redis,

   ) { }

   async create(user: any, name: string, participantIds: number[]): Promise<Conversation> {
      const conversation = new Conversation();
      conversation.name = name;
      conversation.user_id = user.sub;

      const users = await this.userRepository.findByIds(participantIds);

      conversation.participants = users;

      const newConversation = await this.conversationRepository.save(conversation);
      this.server.emit('create-conversation', {
         id: newConversation.id,
         name: conversation.name,
         participantIds: [...participantIds]
      });

      return newConversation;
   }

   async findAll(request): Promise<any> {
      const conversations = await this.conversationRepository.query(`
         SELECT c.id, c.name, m.content, m.created_at, cpu."userId"
         FROM conversation_participants_user cpu
         LEFT JOIN conversation c ON c.id = cpu."conversationId"
         LEFT JOIN "user" u ON u.id = cpu."userId" 
         LEFT JOIN message m ON m.id = c.last_message_id
         WHERE cpu."userId" = ${request.user.sub}
         ORDER BY c.last_message_id DESC;`);

      const result = await Promise.all(conversations.map(async (c: Conversation) => {
         const redisKey = `nons:${c.id}`;
         let redisData = await this.cache.get(redisKey);

         if (!redisData) {
            const conversation = await this.conversationRepository.findOne({ where: { id: c.id }, relations: ['participants'] })
            const dataSet = conversation.participants.map(participant => ({
               id: participant.id,
               value: 0,
            }));
            await this.cache.set(redisKey, JSON.stringify(dataSet));
            redisData = JSON.stringify(dataSet);
         }

         const parsedData = JSON.parse(redisData);
         const userNons = parsedData.find((r) => r.id === request.user.sub)?.value || 0;

         return {
            ...c,
            nons: userNons,
         };
      }))

      return result;
   }

   async findOne(id: number): Promise<Conversation> {
      return await this.dataSource
         .createQueryBuilder()
         .select('conver')
         .from(Conversation, 'conver')
         .leftJoinAndMapOne(
            'conver.user',
            User,
            'user',
            'user.id = conver.user_id'
         )
         .where('conver.id = :id', { id })
         .leftJoinAndSelect('conver.participants', 'participants')
         .getOne();
   }

   async updateLastMessage(id: number, converId: number): Promise<any> {
      return await this.dataSource.query(
         `UPDATE conversation SET last_message_id = ${id} WHERE id = ${converId}`
      )
   }

}
