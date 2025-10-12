import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ContentType, ContentStatus } from '../enums/content.enum';

export enum ContentSort {
  HIGHEST = 'highest',
  NEWEST = 'newest',
}

export class QueryPublicContentDto {
  @IsOptional()
  @IsEnum(ContentType, { message: 'type must be ARTICLE or FICTION_STORY' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  type?: ContentType;

  @IsOptional()
  @IsEnum(ContentStatus, {
    message: 'status must be DRAFT, REVIEW, or PUBLISHED',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toUpperCase() : value,
  )
  status?: ContentStatus;

  @IsOptional()
  @IsString()
  keyword?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : parseInt(value, 10),
  )
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) =>
    value === undefined || value === null ? undefined : parseInt(value, 10),
  )
  limit?: number;

  // New: sort enum to accept 'highest' or 'newest' from frontend
  @IsOptional()
  @IsEnum(ContentSort, { message: 'sort must be "highest" or "newest"' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.toLowerCase() : value,
  )
  sort?: ContentSort;
  @IsOptional()
  @IsString()
  category?: string;
}
