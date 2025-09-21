import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { MinAge } from '../../../common/decorators/min-age.decorator';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateProfileDto
  implements Omit<Prisma.ProfileCreateInput, 'user'>
{
  @IsString()
  @MinLength(8)
  @MaxLength(199)
  fullName: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsUrl()
  @IsOptional()
  avatarUrl?: string;

  @Type(() => Number)
  @IsInt()
  @Min(18)
  phone: string;

  @Type(() => Date)
  @IsDate()
  @MinAge(18)
  birthDate?: string | Date;
}
