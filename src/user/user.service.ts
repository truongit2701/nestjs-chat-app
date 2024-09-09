import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class UserService {
   constructor(
      @InjectRepository(User)
      private userRepository: Repository<User>,
   ) { }

   async findAll(id: number) {
      return await this.userRepository.createQueryBuilder('user').where('user.id != :id', { id }).getMany();
   }

   async updateAvatar(id: number, avatar: string) {
      return await this.userRepository.update({ id: id }, { avatar });
   }

   async findOne(id: number): Promise<User> {
      return this.userRepository.findOne({ where: { id } });
   }

   async findOneByName(username: string): Promise<User> {
      return this.userRepository.findOneBy({ username });
   }

   async signUp(username: string, password: string) {
      const existingUser = await this.userRepository.findOne({ where: { username } });

      if (existingUser) {
         throw new BadRequestException('Username already exists');
      }

      const salt = await bcrypt.genSalt();
      const hashedPassword = await bcrypt.hash(password, salt);

      const user = new User();
      user.username = username;
      user.password = hashedPassword;

      await this.userRepository.save(user);

      return;
   }
}
