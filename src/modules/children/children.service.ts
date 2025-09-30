import { Injectable } from '@nestjs/common';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}
  create(createChildDto: CreateChildDto) {
    return 'This action adds a new child';
  }

  findAll() {
    return `This action returns all child`;
  }

  findOne(id: number) {
    return `This action returns a #${id} child`;
  }

  async findChildProfileWithParent(id: string) {
    return await this.prisma.childProfile.findUnique({
      where: { id },
      include: { parent: true },
    });
  }

  update(id: number, updateChildDto: UpdateChildDto) {
    return `This action updates a #${id} child`;
  }

  remove(id: number) {
    return `This action removes a #${id} child`;
  }
}
