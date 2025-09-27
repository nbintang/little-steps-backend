import { IntersectionType } from '@nestjs/mapped-types';
import { CreateProfileDto } from '../../profile/dto/create-profile.dto';
export class GoogleRegisterDto extends IntersectionType(CreateProfileDto) {}
