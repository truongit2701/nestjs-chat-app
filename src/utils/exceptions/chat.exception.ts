import { HttpStatus } from "@nestjs/common";
import { HttpException } from "@nestjs/common";

export class ChatException extends HttpException {
   constructor(message: string) {
      super(message, HttpStatus.BAD_REQUEST);
   }
}
