import { Body, Controller, Get, HttpCode, HttpStatus, Post, Request, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';
import { Response } from 'express';
import { Public } from 'src/utils/decorator/public.decorator';

@Controller('auth')
export class AuthController {
   constructor(private authService: AuthService) { }

   @Public()
   @HttpCode(HttpStatus.OK)
   @Post('login')
   signIn(@Body() signInDto: Record<string, any>) {
      return this.authService.signIn(signInDto.username, signInDto.password);
   }

   @Public()
   @HttpCode(HttpStatus.OK)
   @Post('register')
   async signUp(@Body() signInDto: Record<string, any>, @Res() res: Response) {
      await this.authService.signUp(signInDto.username, signInDto.password);
      return res.status(HttpStatus.OK).send('Register successfully!');
   }

   @UseGuards(AuthGuard)
   @Get('profile')
   getProfile(@Request() req) {
      return req.user;
   }
}
