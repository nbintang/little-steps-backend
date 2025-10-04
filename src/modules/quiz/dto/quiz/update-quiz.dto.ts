import { Transform } from 'class-transformer';
import {
  IsString,
  IsOptional,
  IsInt,
  IsUUID,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

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

  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Rating must be a valid number' },
  )
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  rating?: number;
}
