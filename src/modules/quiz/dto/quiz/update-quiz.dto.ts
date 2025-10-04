import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsInt, IsUUID } from 'class-validator';

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  title?: string;

  @IsString()
  @IsOptional()
  @Transform(({ value }) => value?.trim())
  description?: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  duration?: number;

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
