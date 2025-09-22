import { IntersectionType } from '@nestjs/mapped-types';
import { CreateAddressDto } from 'src/modules/address/dto/create-address.dto';
import { CreateProfileDto } from 'src/modules/profile/dto/create-profile.dto';

export class GoogleRegisterDto extends IntersectionType(
  CreateProfileDto,
  CreateAddressDto,
) {}
