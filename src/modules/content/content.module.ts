import { Module } from '@nestjs/common';
import { ContentService } from './services/content.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { PublishedContentController } from './controllers/published-content.controller';
import { ContentController } from './controllers/content.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContentController, PublishedContentController],
  providers: [ContentService, AccessControlService],
  exports: [ContentService],
})
export class ContentModule {}
