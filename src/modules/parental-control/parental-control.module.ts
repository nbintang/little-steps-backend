import { Module } from '@nestjs/common';
import { ParentalControlService } from './parental-control.service';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '../../config/config.module';
import { ConfigService } from '../../config/config.service';
import { ChildAccessGuard } from './guards/child-access.guard';
import { ParentalControlController } from './parental-control.controller';
import { AccessControlService } from '../auth/shared/access-control.service';

@Module({
  imports: [
    PrismaModule,
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.jwt.childSecret,
        signOptions: { expiresIn: '12h' },
      }),
    }),
  ],
  controllers: [ParentalControlController],
  providers: [ParentalControlService, ChildAccessGuard, AccessControlService],
  exports: [ParentalControlService, ChildAccessGuard, JwtModule],
})
export class ParentalControlModule {}
