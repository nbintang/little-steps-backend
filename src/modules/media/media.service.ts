import { Injectable, NotFoundException } from '@nestjs/common';
import { CloudinaryService } from '../../common/cloudinary/cloudinary.service';
import { QueryMediaDto } from './dto/query-media.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class MediaService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly httpService: HttpService,
  ) {}

  async uploadImage(file: Express.Multer.File, query: QueryMediaDto) {
    const { folder, existedUrl } = query;
    const exitedPublicId = existedUrl
      ? this.cloudinaryService.extractPublicId(existedUrl)
      : undefined;
    const { secure_url, public_id, created_at } =
      await this.cloudinaryService.uploadFile({
        file,
        folder,
        public_id: exitedPublicId,
      });
    return {
      message: `Image uploaded to ${folder} successfully`,
      data: {
        secureUrl: secure_url,
        publicId: public_id,
        createdAt: created_at,
      },
    };
  }

  async uploadDocument(file: Express.Multer.File, query: QueryMediaDto) {
    const { folder, existedUrl } = query;
    const exitedPublicId = existedUrl
      ? this.cloudinaryService.extractPublicId(existedUrl)
      : undefined;
    const { public_id, created_at } = await this.cloudinaryService.uploadFile({
      file,
      folder,
      public_id: exitedPublicId,
    });
    const downloadEndpoint =
      `${process.env.PROD_BACKEND_URL || 'http://localhost:3000'}` +
      `/api/upload/document/download?publicId=${encodeURIComponent(public_id)}`;
    return {
      message: `Document uploaded to ${folder} successfully`,
      data: {
        secureUrl: downloadEndpoint,
        publicId: public_id,
        createdAt: created_at,
      },
    };
  }

  async downloadDocument(publicId: string) {
    if (!publicId) throw new NotFoundException('publicId required');
    const info = await this.cloudinaryService.getResource(publicId, 'raw');
    const url = info.secure_url;
    return await lastValueFrom(
      this.httpService.get<Buffer>(url, { responseType: 'arraybuffer' }),
    );
  }
}
