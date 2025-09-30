import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { getDay } from 'date-fns';
import { toZonedTime as utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../common/prisma/prisma.service';
import { DayOfWeek } from './enums/day-of-week.enum';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../config/config.service';
import { ChildPayload } from './interfaces/child-payload.interface';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';

@Injectable()
export class ParentalControlService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}
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
  private async checkOverlap(
    childId: string,
    day: DayOfWeek,
    startTime: Date,
    endTime: Date,
    excludeScheduleId?: string, // opsional untuk update
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
  async getCurrentAccessWindow(childId: string) {
    const nowUTC = new Date();
    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: { childId },
    });
    const validWindows = [];

    const nowLocal = utcToZonedTime(nowUTC, 'Asia/Jakarta');
    const today = DayOfWeek[getDay(nowLocal)];
    for (const s of schedules) {
      if (today !== s.day) continue;
      const todayDate = nowLocal.toISOString().split('T')[0];
      const startLocal = utcToZonedTime(
        new Date(`${todayDate}T${s.startTime.toTimeString().split(' ')[0]}`),
        s.timezone || 'UTC',
      );
      const endLocal = utcToZonedTime(
        new Date(`${todayDate}T${s.endTime.toTimeString().split(' ')[0]}`),
        s.timezone || 'UTC',
      );

      const nowM = nowLocal.getHours() * 60 + nowLocal.getMinutes();
      const startM = startLocal.getHours() * 60 + startLocal.getMinutes();
      const endM = endLocal.getHours() * 60 + endLocal.getMinutes();

      validWindows.push({
        day: s.day,
        startTime: startLocal,
        endTime: endLocal,
        timezone: s.timezone,
        activeNow:
          startM <= endM
            ? nowM >= startM && nowM <= endM
            : nowM >= startM || nowM <= endM,
      });
    }

    return validWindows;
  }

  async isChildAllowed(childId: string): Promise<boolean> {
    const nowUTC = new Date();
    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: { childId },
    });
    if (!schedules || schedules.length === 0) return false;
    for (const s of schedules) {
      const tz = s.timezone || 'UTC';
      const nowLocal = utcToZonedTime(nowUTC, tz);
      const weekdayIndex = getDay(nowLocal);
      const today = DayOfWeek[weekdayIndex];
      if (today !== s.day) continue;
      const start = utcToZonedTime(s.startTime, tz);
      const end = utcToZonedTime(s.endTime, tz);
      const nowM = nowLocal.getHours() * 60 + nowLocal.getMinutes();
      const startM = start.getHours() * 60 + start.getMinutes();
      const endM = end.getHours() * 60 + end.getMinutes();
      if (startM <= endM) {
        if (nowM >= startM && nowM <= endM) return true;
      } else {
        if (nowM >= startM || nowM <= endM) return true;
      }
    }
    return false;
  }

  async signChildToken(parentId: string, childId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childId },
      include: { parent: true },
    });
    if (!child || child.parentId !== parentId) {
      throw new ForbiddenException('Child not found or not owned by you');
    }
    const payload: ChildPayload = {
      sub: child.id,
      childId: child.id,
      parentId: child.parentId,
    };
    return this.jwtService.signAsync(payload, {
      secret: this.configService.jwt.childSecret,
      expiresIn: '12h',
    });
  }
}
