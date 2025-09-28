import { Provider } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '../../../config/config.service';

export const CloudinaryProvider: Provider = {
  provide: 'CLOUDINARY',
  useFactory: (config: ConfigService) => {
    cloudinary.config({
      cloud_name: config.cloudinary.cloudName,
      api_key: config.cloudinary.apiKey,
      api_secret: config.cloudinary.apiSecret,
    });
    return cloudinary;
  },
  inject: [ConfigService],
};
