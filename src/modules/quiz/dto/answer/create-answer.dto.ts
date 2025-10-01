import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateAnswerDto {
  @IsString()
  @IsNotEmpty()
  text: string;

  @IsString()
  @IsOptional()
  imageAnswer?: string;

  @IsNotEmpty()
  isCorrect: boolean;
}
