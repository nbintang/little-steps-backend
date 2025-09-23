import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { UserModule } from '../user/user.module';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [PrismaModule, UserModule],
  controllers: [ProfileController],
  providers: [ProfileService, AccessControlService],
  exports: [ProfileService],
})
export class ProfileModule {}
