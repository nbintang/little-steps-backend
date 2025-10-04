import { ContentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsUrl, IsUUID } from 'class-validator';

export class CreateContentDto {
  @IsString()
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsOptional()
  contentJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  excerpt?: string;

  @IsOptional()
  @IsUrl({}, { message: 'coverImage must be a valid URL' })
  coverImage?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.DRAFT;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
