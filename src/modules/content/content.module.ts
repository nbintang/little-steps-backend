import { Module } from '@nestjs/common';
import { ContentService } from './content.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { PublishedContentController } from './published-content.controller';
import { ContentController } from './content.controller';

@Module({
  imports: [PrismaModule],
  controllers: [ContentController, PublishedContentController],
  providers: [ContentService, AccessControlService],
})
export class ContentModule {}
