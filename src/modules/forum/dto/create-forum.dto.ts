import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateForumDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsOptional()
  categoryId?: string;
}
