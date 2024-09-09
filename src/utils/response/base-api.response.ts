import { HttpStatus } from '@nestjs/common';

export class BaseResponse {
   status?: HttpStatus;
   message?: string;
   data?: any;

   constructor({ status, message, data }: BaseResponse) {
      this.status = status || HttpStatus.OK;
      this.message = message || 'OK';
      this.data = data || null;
   }
}

export class BaseResponseDataNull extends BaseResponse {
   data?: any;
}
