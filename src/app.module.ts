import { RedisModule } from '@liaoliaots/nestjs-redis';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './auth/auth.guard';
import { AuthModule } from './auth/auth.module';
import { Conversation } from './conversation/conversation.entity';
import { ConversationModule } from './conversation/conversation.module';
import { GatewayModule } from './gateway/gateway.module';
import { Message } from './message/message.entity';
import { MessageModule } from './message/message.module';
import { User } from './user/user.entity';
import { UserModule } from './user/user.module';
import { FileUploadModule } from './file-upload/file-upload.module';
import { join } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MulterModule } from '@nestjs/platform-express';
import { PostModule } from './post/post.module';
import { CommentModule } from './comment/comment.module';
import { Post } from './post/post.entity';
import { Comment } from './comment/entities/comment.entity';

@Module({
  imports: [
    ConfigModule.forRoot(),

    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',  // URL path where files will be served
    }),

    RedisModule.forRoot({
      config: {
        host: process.env.CONFIG_REDIS_HOST,
        port: Number(process.env.CONFIG_REDIS_PORT),
        password: process.env.CONFIG_REDIS_PASSWORD,
        db: 0,
      },
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: +process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_DB_NAME,
      entities: [User, Conversation, Message, Post, Comment],
      synchronize: true
    }),

    UserModule,
    ConversationModule,
    AuthModule,
    GatewayModule,
    MessageModule,
    FileUploadModule,
    PostModule,
    CommentModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }
