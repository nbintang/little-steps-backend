import { Inject, Injectable, LoggerService } from '@nestjs/common';
import { format, getDay } from 'date-fns';
import { toZonedTime as utcToZonedTime } from 'date-fns-tz';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { DayOfWeek } from '../enums/day-of-week.enum';
import { CurrentAccessWindow } from '../interfaces/current-access.interface';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

@Injectable()
export class ParentalControlScheduleService {
  // Day mapping: getDay() returns 0-6 (SUN-SAT)
  private readonly dayMap = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };

  constructor(
    private readonly prisma: PrismaService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async isChildAllowed(childId: string): Promise<boolean> {
    const nowUTC = new Date();
    this.logger.log(`[isChildAllowed] NOW UTC: ${nowUTC.toISOString()}`);

    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: { childId },
    });

    this.logger.log(
      `[isChildAllowed] Found ${schedules.length} schedule(s) for child ${childId}`,
    );

    if (!schedules || schedules.length === 0) {
      this.logger.warn(`[isChildAllowed] No schedules found, returning false`);
      return false;
    }

    for (const s of schedules) {
      // ✅ DEFAULT ke Asia/Jakarta jika timezone kosong
      const tz = s.timezone || 'Asia/Jakarta';
      this.logger.log(
        `[isChildAllowed] Processing schedule with timezone: ${tz}`,
      );

      const nowLocal = utcToZonedTime(nowUTC, tz);
      this.logger.log(
        `[isChildAllowed] NOW in ${tz}: ${nowLocal.toLocaleString()}`,
      );

      // Get day of week for today in target timezone
      const weekdayIndex = getDay(nowLocal);
      // ✅ GUNAKAN dayMap INSTEAD OF DayOfWeek[index]
      const today = this.dayMap[weekdayIndex];

      this.logger.log(
        `[isChildAllowed] Today: ${today} (index: ${weekdayIndex}), Schedule day: ${s.day}`,
      );
      this.logger.log(
        `[isChildAllowed] DayOfWeek enum value: ${DayOfWeek[weekdayIndex]}`,
      );

      // Bandingkan day dengan benar (case-insensitive)
      if (String(today).toUpperCase() !== String(s.day).toUpperCase()) {
        this.logger.log(
          `[isChildAllowed] Day mismatch (${today} !== ${s.day}), skipping this schedule`,
        );
        continue;
      }

      this.logger.log(`[isChildAllowed] ✅ Day match!`);

      // Extract time dari database time field
      const startTimeStr = format(s.startTime, 'HH:mm:ss');
      const endTimeStr = format(s.endTime, 'HH:mm:ss');

      this.logger.log(
        `[isChildAllowed] Start time: ${startTimeStr}, End time: ${endTimeStr}`,
      );

      const [startH, startMin] = startTimeStr.split(':').map(Number);
      const [endH, endMin] = endTimeStr.split(':').map(Number);

      const nowM = nowLocal.getHours() * 60 + nowLocal.getMinutes();
      const startM = startH * 60 + startMin;
      const endM = endH * 60 + endMin;

      this.logger.log(
        `[isChildAllowed] Now in minutes: ${nowM}, Start: ${startM}, End: ${endM}`,
      );

      let isInRange = false;

      if (startM <= endM) {
        // Normal case: e.g., 08:00 - 17:00
        isInRange = nowM >= startM && nowM <= endM;
        this.logger.log(
          `[isChildAllowed] Normal case (${startM} <= ${endM}): ${isInRange}`,
        );
      } else {
        // Overnight case: e.g., 22:00 - 06:00
        isInRange = nowM >= startM || nowM <= endM;
        this.logger.log(
          `[isChildAllowed] Overnight case (${startM} > ${endM}): ${isInRange}`,
        );
      }

      if (isInRange) {
        this.logger.log(
          `[isChildAllowed] ✅ Child IS ALLOWED - returning true`,
        );
        return true;
      }
    }

    this.logger.log(
      `[isChildAllowed] ❌ Child NOT allowed in any schedule - returning false`,
    );
    return false;
  }

  async getCurrentAccessWindow(
    childId: string,
  ): Promise<CurrentAccessWindow[]> {
    const schedules = await this.prisma.parentalControlSchedule.findMany({
      where: { childId },
    });

    const windows: CurrentAccessWindow[] = [];

    for (const s of schedules) {
      const tz = s.timezone || 'Asia/Jakarta';
      const nowInTz = utcToZonedTime(new Date(), tz);

      // ✅ FIX: Gunakan format() like isChildAllowed() untuk consistency
      const startTimeStr = format(s.startTime, 'HH:mm:ss');
      const endTimeStr = format(s.endTime, 'HH:mm:ss');

      const [sh, sm] = startTimeStr.split(':').map(Number);
      const [eh, em] = endTimeStr.split(':').map(Number);

      const nowMinutes = nowInTz.getHours() * 60 + nowInTz.getMinutes();
      const startTotal = sh * 60 + sm;
      const endTotal = eh * 60 + em;

      const weekdayIdx = getDay(nowInTz);
      const todayStr = this.dayMap[weekdayIdx];

      // ✅ FIX: Apply same overnight logic as isChildAllowed()
      const isDayMatch =
        String(todayStr).toUpperCase() === String(s.day).toUpperCase();

      let isTimeInRange = false;
      if (startTotal <= endTotal) {
        // Normal case
        isTimeInRange = nowMinutes >= startTotal && nowMinutes <= endTotal;
      } else {
        // Overnight case
        isTimeInRange = nowMinutes >= startTotal || nowMinutes <= endTotal;
      }

      const activeNow = isDayMatch && isTimeInRange;

      windows.push({
        day: s.day as any,
        startTime: startTimeStr,
        endTime: endTimeStr,
        timezone: tz,
        activeNow,
      });
    }

    return windows;
  }
}
