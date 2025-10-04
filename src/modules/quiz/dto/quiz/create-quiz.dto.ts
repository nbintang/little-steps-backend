// create-quiz.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsInt,
  IsUUID,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { CreateQuestionInQuizDto } from '../question/create-question.dto';

export class CreateQuizDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  duration?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionInQuizDto)
  questions?: CreateQuestionInQuizDto[];

  @IsOptional()
  @IsUUID()
  categoryId?: string;
}
