import { ContentStatus, Prisma } from '@prisma/client';
import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';

export class CreateContentDto
  implements Omit<Prisma.ContentCreateInput, 'author' | 'slug' | 'type'>
{
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
}
