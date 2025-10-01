import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async findChildProfileWithParent(id: string) {
    return await this.prisma.childProfile.findUnique({
      where: { id },
      include: { parent: true },
    });
  }
}
