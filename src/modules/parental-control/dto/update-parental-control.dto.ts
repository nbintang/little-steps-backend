import { PartialType } from '@nestjs/mapped-types';
import { CreateParentalControlDto } from './create-parental-control.dto';

export class UpdateParentalControlDto extends PartialType(CreateParentalControlDto) {}
