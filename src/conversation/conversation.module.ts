import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { ConversationController } from './conversation.controller';
import { Conversation } from './conversation.entity';
import { ConversationService } from './conversation.service';

@Module({
   imports: [TypeOrmModule.forFeature([Conversation, User])],
   controllers: [ConversationController],
   providers: [ConversationService],
   exports: [ConversationService],
})
export class ConversationModule { }
