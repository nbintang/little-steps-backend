import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../config/config.service';
import { CreateScheduleDto } from '../dto/create-schedule.dto';
import { UpdateScheduleDto } from '../dto/update-schedule.dto';

@Injectable()
export class ParentalControlService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
  private async checkOverlap(
    childId: string,
    day: DayOfWeek,
    startTime: Date,
    endTime: Date,
    excludeScheduleId?: string,
  ): Promise<boolean> {
    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: {
        childId,
        day,
        NOT: excludeScheduleId ? { id: excludeScheduleId } : undefined,
      },
    });
    const startM = startTime.getHours() * 60 + startTime.getMinutes();
    const endM = endTime.getHours() * 60 + endTime.getMinutes();
    for (const s of schedules) {
      const sStartM = s.startTime.getHours() * 60 + s.startTime.getMinutes();
      const sEndM = s.endTime.getHours() * 60 + s.endTime.getMinutes();
      const overlap =
        (startM >= sStartM && startM < sEndM) ||
        (endM > sStartM && endM <= sEndM) ||
        (startM <= sStartM && endM >= sEndM);
      if (overlap) return true;
    }
    return false;
  }

  async createSchedule(
    parentId: string,
    childId: string,
    dto: CreateScheduleDto,
  ) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childId },
    });
    if (!child || child.parentId !== parentId) throw new ForbiddenException();
    if (await this.checkOverlap(childId, dto.day, dto.startTime, dto.endTime)) {
      throw new ForbiddenException('Schedule overlaps with existing schedule');
    }
    const schedule = await this.prisma.parentalControlSchedule.create({
      data: { ...dto, childId },
    });
    return { data: schedule };
  }

  async listSchedules(parentId: string, childId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childId },
    });
    if (!child || child.parentId !== parentId) throw new ForbiddenException();

    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: { childId },
      orderBy: { day: 'asc' },
    });
    return { data: schedules };
  }

  async updateSchedule(
    parentId: string,
    scheduleId: string,
    dto: UpdateScheduleDto,
  ) {
    const schedule = await this.prisma.parentalControlSchedule.findUnique({
      where: { id: scheduleId },
      include: { child: true },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.child.parentId !== parentId) throw new ForbiddenException();
    if (
      await this.checkOverlap(
        schedule.childId,
        dto.day,
        dto.startTime,
        dto.endTime,
        scheduleId,
      )
    ) {
      throw new ForbiddenException('Schedule overlaps with existing schedule');
    }

    const updated = await this.prisma.parentalControlSchedule.update({
      where: { id: scheduleId },
      data: dto,
    });

    return { data: updated };
  }

  async deleteSchedule(parentId: string, scheduleId: string) {
    const schedule = await this.prisma.parentalControlSchedule.findUnique({
      where: { id: scheduleId },
      include: { child: true },
    });
    if (!schedule) throw new NotFoundException();
    if (schedule.child.parentId !== parentId) throw new ForbiddenException();

    await this.prisma.parentalControlSchedule.delete({
      where: { id: scheduleId },
      include: { child: { select: { id: true, name: true } } },
      omit: { childId: true },
    });
    return { message: 'Schedule deleted' };
  }
}
