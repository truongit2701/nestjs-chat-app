import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from 'src/user/user.service';
import { jwtConstants } from './contstant';

@Injectable()
export class AuthService {
   constructor(private userService: UserService, private jwtService: JwtService) { }

   async signIn(
      username: string,
      pass: string,
   ): Promise<{ access_token: string, username: string, avatar: string, id: number }> {

      const user = await this.userService.findOneByName(username);

      if (bcrypt.compareSync(pass, user.password) === false) {
         throw new UnauthorizedException('Password is incorrect');
      }

      const payload = { sub: user.id, username: user.username };
      return {
         username: user.username,
         avatar: user.avatar,
         access_token: await this.jwtService.signAsync(payload),
         id: user.id
      };
   }

   async signUp(
      username: string,
      pass: string,
   ) {
      return await this.userService.signUp(username, pass);
   }
}
