import { IntersectionType } from '@nestjs/mapped-types';
import { CreateProfileDto } from 'src/modules/profile/dto/create-profile.dto';

export class GoogleRegisterDto extends IntersectionType(CreateProfileDto) {}
