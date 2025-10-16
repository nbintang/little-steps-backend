import { Transform } from 'class-transformer';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export enum ProgressChartType {
  OVERALL = 'overall',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
}

export class QueryStatisticQuizDto {
  @IsOptional()
  @Transform(({ value }: { value: ProgressChartType }) => value?.toLowerCase())
  @IsEnum(ProgressChartType, {
    message: 'type must be one of: overall, weekly, monthly',
  })
  type?: ProgressChartType;

  @IsOptional()
  @IsString()
  start?: string; // ISO date string (e.g., 2025-10-01)

  @IsOptional()
  @IsString()
  end?: string;

  @IsOptional()
  @IsUUID()
  childId?: string;

  @IsOptional()
  @IsUUID()
  quizId?: string;

  @IsOptional()
  @IsUUID()
  category?: string;
}
