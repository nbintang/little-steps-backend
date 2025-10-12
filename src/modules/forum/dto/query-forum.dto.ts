import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ForumSort } from '../enums/forum.enum';

export class QueryForumDto {
  @IsOptional()
  @IsString()
  keyword?: string;
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
  @IsEnum(ForumSort, {
    message: `sort must be NEWEST, OLDEST, MOST_ACTIVE, RECENTLY_UPDATED`,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  sort?: ForumSort;

  @IsOptional()
  @IsString()
  category?: string;
  @IsOptional()
  @IsString()
  userId?: string;
}
