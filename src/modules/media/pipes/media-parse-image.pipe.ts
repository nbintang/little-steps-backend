import { Injectable, PipeTransform, BadRequestException } from '@nestjs/common';

@Injectable()
export class MediaParseImagePipe implements PipeTransform {
  private readonly allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg'];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  transform(file: Express.Multer.File): Express.Multer.File {
    if (!file) throw new BadRequestException('File is required');
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only PNG, JPEG, or JPG images are allowed',
      );
    }
    if (file.size > this.maxFileSize) {
      throw new BadRequestException('Image must be under 5MB');
    }
    return file;
  }
}
