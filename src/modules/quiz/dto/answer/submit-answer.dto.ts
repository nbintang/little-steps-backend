import { IsUUID, IsOptional } from 'class-validator';

export class SubmitAnswerDto {
  @IsUUID()
  questionId: string;

  @IsOptional()
  @IsUUID()
  selectedAnswerId?: string | null;
}
