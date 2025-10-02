import { DayOfWeek } from '../enums/day-of-week.enum';

export interface CurrentAccessWindow {
  day: DayOfWeek;
  startTime: string;
  endTime: string;
  timezone: string;
  activeNow: boolean;
}
