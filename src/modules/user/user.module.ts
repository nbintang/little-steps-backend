import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { AccessControlService } from '../auth/shared/access-control.service';
@Module({
  imports: [PrismaModule],
  controllers: [UserController],
  providers: [UserService, AccessControlService],
  exports: [UserService],
})
export class UserModule {}
