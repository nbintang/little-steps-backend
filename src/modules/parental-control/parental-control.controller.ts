// src/parental-control/parental-control.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ParentalControlService } from './parental-control.service';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { CompletedProfileGuard } from '../auth/guards/completed-profile.guard';
import { VerifyEmailGuard } from '../auth/guards/verify-email.guard';

@Controller('parental-control/children/:childId/schedules')
@Roles(UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
export class ParentalControlController {
  constructor(private readonly parentalService: ParentalControlService) {}

  @Post()
  create(
    @Req() req,
    @Param('childId') childId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return this.parentalService.createSchedule(req.user.sub, childId, dto);
  }

  @Get()
  list(@Req() req, @Param('childId') childId: string) {
    return this.parentalService.listSchedules(req.user.sub, childId);
  }

  @Patch(':scheduleId')
  update(
    @Req() req,
    @Param('scheduleId') scheduleId: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return this.parentalService.updateSchedule(req.user.sub, scheduleId, dto);
  }

  @Delete(':scheduleId')
  delete(@Req() req, @Param('scheduleId') scheduleId: string) {
    return this.parentalService.deleteSchedule(req.user.sub, scheduleId);
  }
}
