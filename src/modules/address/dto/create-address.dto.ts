import { Prisma } from '@prisma/client';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsLatitude,
  IsLongitude,
  MaxLength,
  Matches,
} from 'class-validator';

export class CreateAddressDto
  implements Omit<Prisma.AddressCreateInput, 'profile'>
{
  @IsString()
  @IsNotEmpty({ message: 'City tidak boleh kosong' })
  @MaxLength(100, { message: 'City maksimal 100 karakter' })
  city: string;

  @IsString()
  @IsNotEmpty({ message: 'Country tidak boleh kosong' })
  @MaxLength(100, { message: 'Country maksimal 100 karakter' })
  country: string;

  @IsOptional()
  @IsLatitude({ message: 'Latitude harus berupa koordinat valid' })
  latitude?: number;

  @IsOptional()
  @IsLongitude({ message: 'Longitude harus berupa koordinat valid' })
  longitude?: number;

  @IsString()
  @IsNotEmpty({ message: 'Province tidak boleh kosong' })
  @MaxLength(100, { message: 'Province maksimal 100 karakter' })
  province: string;

  @IsString()
  @IsNotEmpty({ message: 'Street tidak boleh kosong' })
  @MaxLength(255, { message: 'Street maksimal 255 karakter' })
  street: string;

  @IsString()
  @IsNotEmpty({ message: 'Zip Code tidak boleh kosong' })
  @Matches(/^\d{4,10}$/, { message: 'Zip Code harus berupa angka 4-10 digit' })
  zipCode: string;
}
