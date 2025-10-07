import { ContentStatus } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsUrl,
  IsNotEmpty,
  MaxLength,
} from 'class-validator';

export class CreateContentDto {
  @IsString()
  @IsNotEmpty({ message: 'Title cannot be empty' })
  @MaxLength(150, { message: 'Title cannot exceed 150 characters' })
  @Transform(({ value }) => value?.trim())
  title: string;

  @IsOptional()
  contentJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim())
  @MaxLength(300, { message: 'Excerpt cannot exceed 300 characters' })
  excerpt?: string;

  @IsOptional()
  @IsUrl({}, { message: 'coverImage must be a valid URL' })
  coverImage?: string;

  @IsOptional()
  @IsEnum(ContentStatus, { message: 'Invalid content status' })
  status?: ContentStatus = ContentStatus.DRAFT;

  @IsOptional()
  categoryId?: string;
}
