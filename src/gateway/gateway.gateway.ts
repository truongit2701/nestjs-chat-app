import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConnectedSocket, MessageBody, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer, WsException } from '@nestjs/websockets';
import { Redis } from 'ioredis';
import { Server, Socket } from 'socket.io';
import { Conversation } from 'src/conversation/conversation.entity';
import { MessageService } from 'src/message/message.service';
import { User } from 'src/user/user.entity';
import { WebsocketExceptionsFilter } from 'src/utils/filters/ws-exception.filter';
import { DataSource } from 'typeorm';
import { UserService } from '../user/user.service';

interface SocketData {
   socket_id: string;
   room_id: number
}

@WebSocketGateway({ cors: { origin: '*' } })
@UseFilters(new WebsocketExceptionsFilter())
export class SocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
   @WebSocketServer() server: Server;

   constructor(
      private userService: UserService,

      private messageService: MessageService,
      @InjectRedis() private readonly cache: Redis,
      private jwtService: JwtService,

      private dataSource: DataSource,
   ) { }

   // @SubscribeMessage('redis-emmit-create-conver')
   // async handleCreateConversation(@ConnectedSocket() socket: Socket, @MessageBody() message: any) {
   //    console.log("♥️ ~ SocketGateway ---------- handleCreateConversation ~ data:", message)
   // const conver = await this.dataSource
   //    .createQueryBuilder()
   //    .select('conver')
   //    .from(Conversation, 'conver')
   //    .leftJoinAndMapOne(
   //       'conver.user',
   //       User,
   //       'user',
   //       'user.id = conver.user_id'
   //    )
   //    .where('conver.id = :id', { id: socket.data.room_id })
   //    .leftJoinAndSelect('conver.participants', 'participants')
   //    .getOne();
   // const usernameArray = conver.participants.map(c => c.username);
   // }

   @SubscribeMessage('msg-text')
   async handleMessage(@ConnectedSocket() socket: Socket, @MessageBody() message: { content: string }) {
      const conver = await this.dataSource
         .createQueryBuilder()
         .select('conver')
         .from(Conversation, 'conver')
         .leftJoinAndMapOne(
            'conver.user',
            User,
            'user',
            'user.id = conver.user_id'
         )
         .where('conver.id = :id', { id: socket.data.room_id })
         .leftJoinAndSelect('conver.participants', 'participants')
         .getOne();
      const usernameArray = conver.participants.map(c => c.username);

      const newMessage = await this.messageService.create(
         message.content,
         socket.data.room_id,
         socket.data.user_id,
      );

      this.server.to(usernameArray).emit('msg-text', {
         id: newMessage.id,
         content: message.content,
         converId: conver.id,
         user: {
            id: socket.data.user_id,
            username: socket.data.username,
            avatar: "",
         },
         created_at: newMessage.created_at
      });

      await this.dataSource.query(
         `UPDATE conversation SET last_message_id = ${newMessage.id} WHERE id = ${conver.id}`
      )

      const nonsKey = `nons:${conver.id}`;
      const nons = await this.cache.get(nonsKey);

      const dataUpdate = nons
         ? JSON.parse(nons).map(p => ({
            ...p,
            value: p.id === socket.data.user_id ? 0 : p.value + 1
         }))
         : conver.participants.map(p => ({
            id: p.id,
            value: p.id === socket.data.user_id ? 0 : 1
         }));

      await this.cache.set(nonsKey, JSON.stringify(dataUpdate));
   }

   @SubscribeMessage('join-room')
   async handleJoinRoom(@ConnectedSocket() socket: Socket, @MessageBody() message: { roomId: number }): Promise<void> {
      try {
         socket.data.room_id = message.roomId;

         // update no_of_not_seen
         const nonsKey = `nons:${socket.data.room_id}`;
         const nonsRedis = JSON.parse(await this.cache.get(nonsKey)) || [];

         await this.cache.set(nonsKey, JSON.stringify(nonsRedis.map(n => n.id === socket.data.user_id ? {
            ...n,
            value: 0
         } : n)))
      } catch (e) {
         console.log(e);
      }
   }

   async handleConnection(client: Socket) {
      try {
         console.log(`Client connected: ${client.id}`);
         const token = client.handshake.headers.authorization.split(' ')[1];
         const user = await this.authenticateUser(token);

         if (!user) throw new WsException('User not found');

         client.data = {
            room_id: 0,
            user_id: user.id,
            username: user.username,
         }

         client.join(user.username);

         const cacheUsers = await this.cache.get(`user:${user.id}`);

         if (cacheUsers) {
            const dataParse = JSON.parse(cacheUsers);
            dataParse.push({
               socket_id: client.id,
               room_id: 0
            });
            await this.cache.set(`user:${user.id}`, JSON.stringify(dataParse));
         } else {
            await this.cache.set(`user:${user.id}`, JSON.stringify([{
               socket_id: client.id,
               room_id: 0
            }]));
         }

      } catch (err) {
         console.log("♥️ ~ handleConnection ~ err:", err)
         client.disconnect();
      }
   }

   async handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
      if (client.data) {
         // Remove the client from their room
         client.leave(client.data.username);

         const cacheUsers = JSON.parse(await this.cache.get(`user:${client.data.user_id}`)) || [];

         await this.cache.set(`user:${client.data.user_id}`,
            JSON.stringify(
               cacheUsers.filter((item: SocketData) => item.socket_id !== client.id)
            )
         );

         // Notify other clients about the disconnected user
         this.server.emit('userDisconnected', `${client.data.username} has left the chat.`);
      }
   }


   /**
    * socket emitter for user
    * */
   emitter(to: string[], key: string, data: any) {
      console.log(232323)
      this.server.to(to).emit(key, data);
   }


   /**
    * authen
   */
   private async authenticateUser(token: string) {
      if (!token) {
         return;
      }
      const payload = await this.jwtService.verifyAsync(token);

      const userId = payload.sub;

      // Fetch the user from the database
      const user = await this.userService.findOne(userId);

      if (!user) {
         throw new WsException('User not found');
      }

      return user;
   }
}