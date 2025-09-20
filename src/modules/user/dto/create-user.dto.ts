import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateAddressDto } from 'src/modules/address/dto/create-address.dto';
import { CreateProfileDto } from 'src/modules/profile/dto/create-profile.dto';

export class CreateUserDto implements Omit<Prisma.UserCreateInput, "profile"> {
  @IsEmail()
  @IsString()
  email: string;

  @IsString()
  @Length(8, 199)
  name: string;

  @IsString()
  @MinLength(8)
  @MaxLength(20)
  @Matches(/^(?=.*[A-Z])(?=.*\d).+$/, {
    message:
      'Password harus mengandung minimal satu huruf besar dan satu angka',
  })
  password: string;

  @ValidateNested()
  @Type(() => CreateProfileDto)
  profile: CreateProfileDto

  @ValidateNested()
  @Type(() => CreateAddressDto)
  address : CreateAddressDto
}
