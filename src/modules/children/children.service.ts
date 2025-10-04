import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class ChildrenService {
  constructor(private prisma: PrismaService) {}

  async findChildProfileWithParent(id: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        birthDate: true,
        gender: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        parent: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return {
      data: child,
    };
  }
}
