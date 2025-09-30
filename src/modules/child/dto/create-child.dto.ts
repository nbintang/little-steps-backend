import { Type } from 'class-transformer';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';
import { MinAge } from '../../../common/decorators/min-age.decorator';
import { ChildGender } from '../enums/child-gender.enum';
import { Prisma } from '@prisma/client';

export class CreateChildDto implements Partial<Prisma.ChildProfileCreateInput> {
  @IsString()
  @IsNotEmpty({ message: 'Name tidak boleh kosong' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  @MaxLength(199)
  name: string;

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty({ message: 'Birth date tidak boleh kosong' })
  @MinAge(3, { message: 'Child must be at least 3 years old' })
  birthDate: Date;

  @IsEnum(ChildGender, {
    message: `Gender must be either ${ChildGender.MALE} or ${ChildGender.FEMALE}`,
  })
  @IsNotEmpty({ message: 'Gender tidak boleh kosong' })
  gender: ChildGender;

  @IsUrl()
  @IsOptional()
  avatarUrl: string;
}
