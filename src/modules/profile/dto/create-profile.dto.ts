import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { MinAge } from '../../../common/decorators/min-age.decorator';
import {
  IsDate,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
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

  @IsString()
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Phone harus berupa angka 10-15 digit, bisa diawali +',
  })
  phone: string;

  @Type(() => Date)
  @IsDate()
  @MinAge(18)
  birthDate?: string | Date;
}
