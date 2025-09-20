import { Prisma } from '@prisma/client';
import {
  IsEmail,
  IsString,
  Length,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateUserDto implements Prisma.UserCreateInput {
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

  
}
