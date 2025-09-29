import { Module } from '@nestjs/common';
import { ContentService } from './services/content.service';
import { ContentController } from './controllers/content.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { PublishedContentController } from './controllers/published-content.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContentController, PublishedContentController],
  providers: [ContentService, AccessControlService],
})
export class ContentModule {}
