import { Injectable } from '@nestjs/common';
import { CreateParentalControlDto } from './dto/create-parental-control.dto';
import { UpdateParentalControlDto } from './dto/update-parental-control.dto';

@Injectable()
export class ParentalControlService {
  create(createParentalControlDto: CreateParentalControlDto) {
    return 'This action adds a new parentalControl';
  }

  findAll() {
    return `This action returns all parentalControl`;
  }

  findOne(id: number) {
    return `This action returns a #${id} parentalControl`;
  }

  update(id: number, updateParentalControlDto: UpdateParentalControlDto) {
    return `This action updates a #${id} parentalControl`;
  }

  remove(id: number) {
    return `This action removes a #${id} parentalControl`;
  }
}
