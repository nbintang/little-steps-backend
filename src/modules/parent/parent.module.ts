import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';

import { ParentalControlService } from './services/parental-control.service';
import { ParentalControlScheduleService } from './services/parental-control-schedule.service';
import { AccessControlService } from '../auth/shared/access-control.service';

// Guards
import { ChildAccessGuard } from './guards/child-access.guard';
import { ParentChildrenController } from './controllers/parent-children.controller';
import { ParentChildrenService } from './services/parent-children.service';
import { ParentalControlController } from './controllers/parental-control.controller';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwt.accessSecret,
        signOptions: { expiresIn: '12h' },
      }),
    }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwt.childSecret,
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [ParentChildrenController, ParentalControlController],
  providers: [
    ParentChildrenService,
    ParentalControlService,
    ParentalControlScheduleService,
    AccessControlService,
    ChildAccessGuard,
  ],
  exports: [
    ParentChildrenService,
    ParentalControlService,
    ParentalControlScheduleService,
    ChildAccessGuard,
    JwtModule,
  ],
})
export class ParentModule {}
