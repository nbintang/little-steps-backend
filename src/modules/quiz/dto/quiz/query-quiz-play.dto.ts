import { Transform } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class QueryQuizPlayDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
