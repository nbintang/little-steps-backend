import { ContentStatus, Prisma } from '@prisma/client';
import { IsString, IsOptional, IsEnum, IsUrl } from 'class-validator';

export class CreateContentDto
  implements Omit<Prisma.ContentCreateInput, 'author' | 'slug' | 'type'>
{
  @IsString()
  title: string;

  @IsOptional()
  contentJson?: Record<string, any>;

  @IsOptional()
  @IsString()
  excerpt?: string;

  @IsOptional()
  @IsUrl({}, { message: 'coverImage must be a valid URL' })
  coverImage?: string;

  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus = ContentStatus.DRAFT;
}
