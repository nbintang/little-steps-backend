import { Prisma } from '@prisma/client';
import { IsString } from 'class-validator';

export class CreateCategoryDto implements Partial<Prisma.CategoryCreateInput> {
  @IsString()
  name: string;
}
