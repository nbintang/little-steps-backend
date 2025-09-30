import { Module } from '@nestjs/common';
import { MediaService } from './media.service';
import { MediaController } from './media.controller';
import { HttpModule } from '@nestjs/axios';
import { CloudinaryModule } from '../../common/cloudinary/cloudinary.module';
import { ConfigModule } from '../../config/config.module';

@Module({
  imports: [HttpModule, CloudinaryModule, ConfigModule],
  controllers: [MediaController],
  providers: [MediaService],
})
export class MediaModule {}
