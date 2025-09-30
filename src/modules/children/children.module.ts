import { Module } from '@nestjs/common';
import { ChildrenService } from './children.service';
import { ChildrenController } from './children.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { ParentalControlModule } from '../parental-control/parental-control.module';
@Module({
  imports: [PrismaModule, ConfigModule, ParentalControlModule],
  controllers: [ChildrenController],
  providers: [ChildrenService],
  exports: [ChildrenService],
})
export class ChildrenModule {}
