import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class RateQuizDto {
  @IsOptional()
  @IsNumber(
    { allowNaN: false, allowInfinity: false },
    { message: 'Rating must be a valid number' },
  )
  @Min(0, { message: 'Rating must be at least 0' })
  @Max(5, { message: 'Rating cannot be more than 5' })
  rating?: number;
}
