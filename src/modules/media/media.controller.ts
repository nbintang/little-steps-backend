import {
  Controller,
  Get,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Res,
} from '@nestjs/common';
import { MediaService } from './media.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { MediaParseImagePipe } from './pipes/media-parse-image.pipe';
import { QueryMediaDto } from './dto/query-media.dto';
import { MediaParseDocPipe } from './pipes/media-parse-doc.pipe';
import { Response } from 'express';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}
  @Post('/image/upload')
  @UseInterceptors(
    FileInterceptor('image', {
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  async uploadImage(
    @UploadedFile(MediaParseImagePipe) file: Express.Multer.File,
    @Query() query: QueryMediaDto,
  ) {
    return await this.mediaService.uploadImage(file, query);
  }

  @Post('/document/upload')
  @UseInterceptors(
    FileInterceptor('document', {
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async uploadDocument(
    @UploadedFile(MediaParseDocPipe) file: Express.Multer.File,
    @Query() query: QueryMediaDto,
  ) {
    return await this.mediaService.uploadDocument(file, query);
  }

  @Get('/document/download')
  async downloadDocument(
    @Query('publicId') publicId: string,
    @Res() response: Response,
  ) {
    const axiosResp = await this.mediaService.downloadDocument(publicId);
    const buffer = Buffer.from(axiosResp.data);
    response
      .status(200)
      .set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${publicId}.pdf"`,
        'Content-Length': buffer.byteLength,
      })
      .send(buffer);
  }
}
