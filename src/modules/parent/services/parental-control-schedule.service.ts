import { ForbiddenException, Injectable } from '@nestjs/common';
import { getDay } from 'date-fns';
import { toZonedTime as utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { JwtService } from '@nestjs/jwt';
import { ChildPayload } from '../interfaces/child-payload.interface';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class ParentalControlScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
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
