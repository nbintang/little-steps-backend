import { Module } from '@nestjs/common';
import { ParentalControlService } from './parental-control.service';
import { ParentalControlController } from './parental-control.controller';

@Module({
  controllers: [ParentalControlController],
  providers: [ParentalControlService],
})
export class ParentalControlModule {}
