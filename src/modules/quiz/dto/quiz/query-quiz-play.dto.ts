import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
export enum QuerySort {
  NEWEST = 'newest',
  OLDEST = 'oldest',
  HIGHEST_RATED = 'highest_rated',
  LOWEST_RATED = 'lowest_rated',
  RECENTLY_UPDATED = 'recently_updated',
  A_TO_Z = 'a_to_z',
  Z_TO_A = 'z_to_a',
}
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

  @IsOptional()
  @IsString()
  category?: string;
  @IsOptional()
  @IsEnum(QuerySort, {
    message:
      'sort must be one of: newest, oldest, highest_rated, lowest_rated, recently_updated, a_to_z, z_to_a',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  sort?: QuerySort;

  @IsOptional()
  @IsString()
  keyword?: string;
}
