import { PartialType } from '@nestjs/mapped-types';
import { CreateProfileDto } from './create-profile.dto';
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class UpdateProfileDto extends PartialType(CreateProfileDto) {
  @IsString()
  @IsOptional()
  @IsNotEmpty({ message: 'Name tidak boleh kosong' })
  @MinLength(3, { message: 'Nama minimal 3 karakter' })
  @MaxLength(199)
  name: string;
}
