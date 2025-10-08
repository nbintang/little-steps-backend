import {
  IsNotEmpty,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdateAnswerDto } from '../answer/update-answer.dto';
export class InputQuestionDto {
  @IsOptional()
  id?: string;

  @IsNotEmpty()
  questionJson: any;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => UpdateAnswerDto)
  answers: UpdateAnswerDto[];
}
