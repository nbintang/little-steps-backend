import { Module } from '@nestjs/common';
import { ParentService } from './parent.service';
import { ParentController } from './parent.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [ParentController],
  providers: [ParentService, AccessControlService],
})
export class ParentModule {}
