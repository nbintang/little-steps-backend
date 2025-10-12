import { Module } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoriesController } from './categories.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { PublishedCategoriesController } from './public-categories-controller';

@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController, PublishedCategoriesController],
  providers: [CategoriesService, AccessControlService],
})
export class CategoriesModule {}
