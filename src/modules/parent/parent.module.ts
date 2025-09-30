import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
import { ParentalControlModule } from '../parental-control/parental-control.module';
@Module({
  imports: [PrismaModule, ParentalControlModule],
  controllers: [ParentController],
  providers: [ParentService, AccessControlService],
  exports: [ParentService],
})
export class ParentModule {}
