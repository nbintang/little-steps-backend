import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}
  create(createContentDto: CreateContentDto) {
    return 'This action adds a new article';
  }

  async findArticles() {
    return await this.prisma.content.findMany();
  }

  findOne(id: number) {
    return `This action returns a #${id} article`;
  }

  update(id: number, updateContentDto: UpdateContentDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
