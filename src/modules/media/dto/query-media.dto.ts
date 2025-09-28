import { IsEnum, IsOptional, IsString, IsUrl } from 'class-validator';
import { Transform } from 'class-transformer';
import { MediaFolder } from '../enums/media-folder.enum';

export class QueryMediaDto {
  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'Invalid URL' })
  @Transform(({ value }) => value?.trim())
  existedUrl?: string;

  @IsEnum(MediaFolder, {
    message: 'folder must be one of "lokerin_image" or "lokerin_cv"',
  })
  folder: MediaFolder;
}
