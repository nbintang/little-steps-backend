import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { MinAge } from '../../../common/decorators/min-age.decorator';
import {
  IsDate,
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateProfileDto
  implements Omit<Prisma.ProfileCreateInput, 'user'>
{
  @IsString()
  @MinLength(8)
  @MaxLength(199)
  fullName?: string;

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
  phone?: string;

  @Type(() => Date)
  @IsDate()
  @MinAge(18)
  birthDate?: string | Date;

  @IsOptional()
  @IsLatitude({ message: 'Latitude harus berupa koordinat valid' })
  latitude?: number;

  @IsOptional()
  @IsLongitude({ message: 'Longitude harus berupa koordinat valid' })
  longitude?: number;
}
