import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class MediaParseDocPipe implements PipeTransform {
  private readonly allowedMimeTypes = ['application/pdf'];
  private MB: number = 10;
  private readonly maxFileSize = this.MB * 1024 * 1024; // 10MB
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) throw new BadRequestException('File is required');
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('Only PDF files are allowed');
    }
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Document must be under 10MB');
    }
    return file;
  }
}
