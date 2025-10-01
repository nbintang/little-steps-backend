import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class UpdateAnswerDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  imageAnswer?: string;

  @IsNotEmpty()
  isCorrect: boolean;
}
