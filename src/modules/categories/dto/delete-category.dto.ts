import { IsArray, ArrayNotEmpty, IsUUID } from 'class-validator';

export class DeleteCategoriesDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsUUID('4', { each: true, message: 'Each id must be a valid UUID' })
  ids: string[];
}
