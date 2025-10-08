import { Module } from '@nestjs/common';
import { ForumService } from './services/forum.service';
import { ForumController } from './controllers/forum.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { PostController } from './controllers/post.controller';
import { PostService } from './services/post.service';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [ForumController, PostController],
  providers: [ForumService, PostService, AccessControlService],
})
export class ForumModule {}
