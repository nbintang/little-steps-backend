import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { ChildGender } from '../enums/child-gender.enum';

export class QueryChildDto {
  @IsString()
  @IsOptional()
  name: string;

  @IsEnum(ChildGender, {
    message: `Gender must be either ${ChildGender.MALE} or ${ChildGender.FEMALE}`,
  })
  @IsOptional()
  @Transform(({ value }) => value?.toUpperCase())
  gender: ChildGender;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}
