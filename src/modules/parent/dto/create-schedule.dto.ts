// src/parental-control/dto/create-schedule.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches, // Import Matches
} from 'class-validator';
import { DayOfWeek } from '../enums/day-of-week.enum';

export class CreateScheduleDto {
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  day: DayOfWeek;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'startTime must be in HH:mm or HH:mm:ss format',
  })
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/, {
    message: 'endTime must be in HH:mm or HH:mm:ss format',
  })
  endTime: string;

  @IsString()
  @IsOptional()
  timezone?: string;
}
