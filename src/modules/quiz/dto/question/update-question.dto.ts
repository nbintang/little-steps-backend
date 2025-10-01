import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAnswerDto } from '../answer/update-answer.dto';
export class UpdateQuestionDto {
  @IsNotEmpty()
  questionJson: Record<string, any>;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers: UpdateAnswerDto[];
}
