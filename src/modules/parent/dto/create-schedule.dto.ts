// src/parental-control/dto/create-schedule.dto.ts
import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { DayOfWeek } from '../enums/day-of-week.enum';

export class CreateScheduleDto {
  @IsEnum(DayOfWeek)
  @IsNotEmpty()
  day: DayOfWeek;

  @Type(() => Date)
  @IsDate()
  startTime: Date;

  @Type(() => Date)
  @IsDate()
  endTime: Date;

  @IsString()
  @IsOptional()
  timezone?: string; // default UTC
}
