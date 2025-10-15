import { Prisma } from '@prisma/client';
import { IsEnum, IsString } from 'class-validator';
import { CategoryType } from '../enums/category-type-.enum';

export class CreateCategoryDto implements Partial<Prisma.CategoryCreateInput> {
  @IsString()
  name: string;
  @IsEnum(CategoryType, {
    message: `type must be either ${CategoryType.CHILD} or ${CategoryType.PARENT}`,
  })
  type: CategoryType;
}
