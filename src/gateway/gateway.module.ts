import { Global, Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { jwtConstants } from "src/auth/contstant";
import { MessageModule } from "src/message/message.module";
import { UserModule } from "src/user/user.module";
import { SocketGateway } from "./gateway.gateway";


@Global()
@Module({
   imports: [
      UserModule,
      MessageModule,
      JwtModule.register({
         global: true,
         secret: jwtConstants.secret,
         signOptions: { expiresIn: '10h' },
      }),
   ],
   providers: [SocketGateway]
})
export class GatewayModule { }