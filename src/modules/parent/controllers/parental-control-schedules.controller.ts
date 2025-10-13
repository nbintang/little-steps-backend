import { UserRole } from '../../user/enums/user-role.enum';
import { Roles } from '../../auth/decorators/roles.decorator';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
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
import { ParentalControlService } from '../services/parental-control-crud-schedule.service';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Roles(UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('protected/parent/children/:childId/schedules')
export class ParentalControlSchedulesController {
  constructor(private readonly parentalService: ParentalControlService) {}

  @Post()
  async createSchedule(
    @Req() req,
    @Param('childId') childId: string,
    @Body() dto: CreateScheduleDto,
  ) {
    return await this.parentalService.createSchedule(
      req.user.sub,
      childId,
      dto,
    );
  }

  @Get()
  async listSchedules(@Req() req, @Param('childId') childId: string) {
    return await this.parentalService.listChildrenSchedules(
      req.user.sub,
      childId,
    );
  }

  @Patch(':id')
  async updateSchedule(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return await this.parentalService.updateSchedule(req.user.sub, id, dto);
  }

  @Delete(':id')
  async deleteSchedule(@Req() req, @Param('id') id: string) {
    return await this.parentalService.deleteSchedule(req.user.sub, id);
  }
}
