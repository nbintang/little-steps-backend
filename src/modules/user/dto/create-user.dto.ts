import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { CreateProfileDto } from '../../profile/dto/create-profile.dto';
import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNotEmptyObject,
  IsString,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator'; 

export class CreateUserDto implements Omit<Prisma.UserCreateInput, 'profile'> {
  @IsEmail()
  @IsString()
  @IsNotEmpty({ message: 'Email tidak boleh kosong' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Name tidak boleh kosong' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  @MaxLength(199)
  name: string;

  @IsString()
  @MinLength(8, { message: 'Password minimal 8 karakter' })
  @MaxLength(20, { message: 'Password maksimal 20 karakter' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,20}$/, {
    message:
      'Password harus mengandung huruf besar, huruf kecil, angka, dan simbol',
  })
  password: string;

  @Type(() => Boolean)
  @IsBoolean()
  @IsNotEmpty({ message: 'Harus menyetujui syarat dan ketentuan' })
  acceptedTerms: boolean;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  @IsNotEmptyObject(
    { nullable: false },
    { message: 'Profile tidak boleh kosong dan harus berupa object' },
  )
  profile: CreateProfileDto;
}
