import { IsEnum, IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Transform } from 'class-transformer';
import { ContentType, ContentStatus, Language } from '../enums/content.enum';

export class QueryContentDto {
  @IsOptional()
  @IsEnum(ContentType, { message: 'type must be ARTICLE or FICTION_STORY' })
  @Transform(({ value }) => value?.toUpperCase())
  type?: ContentType;

  @IsOptional()
  @IsEnum(ContentStatus, {
    message: 'status must be DRAFT, REVIEW, or PUBLISHED',
  })
  @Transform(({ value }) => value?.toUpperCase())
  status?: ContentStatus;

  @IsOptional()
  @IsEnum(Language, { message: 'language must be ID, EN, or OTHER' })
  @Transform(({ value }) => value?.toUpperCase())
  language?: Language;

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
}
