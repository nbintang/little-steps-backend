import { Module } from '@nestjs/common';
import { ProgressService } from './progress.service';
import { ProgressController } from './progress.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [PrismaModule],
  controllers: [ProgressController],
  providers: [ProgressService, AccessControlService],
  exports: [ProgressService],
})
export class ProgressModule {}
