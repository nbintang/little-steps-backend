import { UserRole } from 'src/modules/user/enums/user-role.enum';
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
import { ParentalControlService } from '../services/parental-control.service';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Roles(UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('parent/children/:childId')
export class ParentalControlController {
  constructor(private readonly parentalService: ParentalControlService) {}

  @Post('schedules')
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

  @Get('schedules')
  async listSchedules(@Req() req, @Param('childId') childId: string) {
    return await this.parentalService.listSchedules(req.user.sub, childId);
  }

  @Patch('schedules/:id')
  async updateSchedule(
    @Req() req,
    @Param('id') id: string,
    @Body() dto: UpdateScheduleDto,
  ) {
    return await this.parentalService.updateSchedule(req.user.sub, id, dto);
  }

  @Delete('schedules/:id')
  async deleteSchedule(@Req() req, @Param('id') id: string) {
    return await this.parentalService.deleteSchedule(req.user.sub, id);
  }
}
