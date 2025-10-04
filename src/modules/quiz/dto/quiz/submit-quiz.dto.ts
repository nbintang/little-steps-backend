import { IsUUID, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { SubmitAnswerDto } from '../answer/submit-answer.dto';

export class SubmitQuizDto {
  @IsUUID()
  quizId: string;

  @IsUUID()
  childId: string;

  @ValidateNested({ each: true })
  @Type(() => SubmitAnswerDto)
  @ArrayMinSize(0)
  answers: SubmitAnswerDto[];
}
