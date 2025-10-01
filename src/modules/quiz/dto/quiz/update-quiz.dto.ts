import { Transform } from 'class-transformer';
import { IsString, IsOptional } from 'class-validator';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;
}
