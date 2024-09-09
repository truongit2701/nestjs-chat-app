import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { writeFile } from 'fs/promises'; // Import phương thức để lưu tệp
import { extname } from 'path';


@Controller('upload')
export class FileUploadController {
  constructor() { }

  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(@UploadedFile() file: any): Promise<{ url: string }> {
    const randomName = Array(32)
      .fill(null)
      .map(() => Math.round(Math.random() * 16).toString(16))
      .join('');
    const ext = extname(file.originalname);
    const filename = `${randomName}${ext}`;
    const filePath = `./uploads/${filename}`;

    await writeFile(filePath, file.buffer);

    const fileUrl = `/uploads/${filename}`;
    return { url: fileUrl };
  }
}
