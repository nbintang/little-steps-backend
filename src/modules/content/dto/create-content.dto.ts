import { ContentType, ContentStatus, Language, Prisma } from '@prisma/client';
import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  IsBoolean,
  IsJSON,
  IsUrl,
} from 'class-validator';

export class CreateContentDto
  implements Omit<Prisma.ContentCreateInput, 'author'>
{
  @IsString()
  title: string;

  @IsEnum(ContentType, { message: 'type must be ARTICLE or FICTION_STORY' })
  type: ContentType;

  @IsOptional()
  @IsJSON({ message: 'contentJson must be a valid JSON' })
  contentJson?: any;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsUrl({}, { message: 'coverImage must be a valid URL' })
  coverImage?: string;

  @IsOptional()
  @IsJSON({ message: 'attachments must be a valid JSON' })
  attachments?: any;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetAgeMin?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  targetAgeMax?: number;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.DRAFT;

  @IsOptional()
  @IsEnum(Language)
  language?: Language = Language.ID;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean = false;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean = false;

  @IsString()
  createdBy: string;
}
