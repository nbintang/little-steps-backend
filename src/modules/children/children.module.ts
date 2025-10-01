import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { ParentModule } from '../parent/parent.module';
import { ChildrenFictionController } from './controllers/children-fiction.controller';
@Module({
  imports: [PrismaModule, ConfigModule, ParentModule],
  controllers: [ChildrenFictionController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
