import { Injectable } from '@nestjs/common';
import { getDay } from 'date-fns';
import { toZonedTime as utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { CurrentAccessWindow } from '../interfaces/current-access.interface';

@Injectable()
export class ParentalControlScheduleService {
  constructor(private readonly prisma: PrismaService) {}
  async getCurrentAccessWindow(
    childId: string,
  ): Promise<CurrentAccessWindow[]> {
    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: { childId },
    });

    const windows: CurrentAccessWindow[] = [];

    for (const s of schedules) {
      const tz = s.timezone || 'UTC';
      const nowInTz = utcToZonedTime(new Date(), tz);

      const startIso = s.startTime.toISOString();
      const endIso = s.endTime.toISOString();
      const startTimePart = startIso.split('T')[1].split('.')[0];
      const endTimePart = endIso.split('T')[1].split('.')[0];

      const [sh, sm] = startTimePart.split(':').map(Number);
      const [eh, em] = endTimePart.split(':').map(Number);

      const nowMinutes = nowInTz.getHours() * 60 + nowInTz.getMinutes();
      const startTotal = sh * 60 + sm;
      const endTotal = eh * 60 + em;

      const weekdayIdx = getDay(nowInTz);
      const todayStr = DayOfWeek[weekdayIdx];

      const activeNow =
        String(s.day).toUpperCase() === todayStr &&
        (startTotal <= endTotal
          ? nowMinutes >= startTotal && nowMinutes <= endTotal
          : nowMinutes >= startTotal || nowMinutes <= endTotal); // overnight

      windows.push({
        day: s.day as any,
        startTime: startTimePart,
        endTime: endTimePart,
        timezone: tz,
        activeNow,
      });
    }

    return windows;
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
}
