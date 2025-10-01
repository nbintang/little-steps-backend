import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateChildDto } from '../../children/dto/create-child.dto';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateChildDto } from '../../children/dto/update-child.dto';
import { QueryChildDto } from '../../children/dto/query-child.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class ParentChildrenService {
  constructor(private readonly prisma: PrismaService) {}
  async createChildProfile(id: string, createChildDto: CreateChildDto) {
    const child = await this.prisma.childProfile.create({
      data: {
        ...createChildDto,
        parent: { connect: { id } },
      },
      select: {
        id: true,
        name: true,
        birthDate: true,
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

    return { data: child };
  }

  async findAllChildProfile(id: string, query: QueryChildDto) {
    const page = (query.page || 1) - 1;
    const limit = query.limit || 10;
    const skip = page * limit;
    const take = limit;

    const where: Prisma.ChildProfileWhereInput = {
      ...(query.name && {
        name: { contains: query.name, mode: 'insensitive' },
      }),
      ...(query.gender && { gender: query.gender }),
      parent: { id },
    };
    const [data, total] = await Promise.all([
      this.prisma.childProfile.findMany({
        where,
        skip,
        take,
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
      }),
      this.prisma.childProfile.count({ where }),
    ]);
    return {
      data,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findChildProfileById(parentId: string, id: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id, AND: { parent: { id: parentId } } },
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
  async findExistedChildProfileById(parentId: string, id: string) {
    return await this.prisma.childProfile.findUnique({
      where: { id, AND: { parent: { id: parentId } } },
      select: { id: true },
    });
  }
  async updateChildProfile(
    parentId: string,
    childId: string,
    updateChildDto: UpdateChildDto,
  ) {
    const existedChild = await this.findExistedChildProfileById(
      parentId,
      childId,
    );
    if (!existedChild) throw new NotFoundException('Child not found');
    const child = await this.prisma.childProfile.update({
      where: { id: childId },
      data: updateChildDto,
      select: {
        id: true,
        name: true,
        birthDate: true,
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
    return { message: 'Child updated successfully', data: child };
  }

  async deleteChildProfile(parentId: string, childId: string) {
    const existedChild = await this.findExistedChildProfileById(
      parentId,
      childId,
    );
    if (!existedChild) throw new NotFoundException('Child not found');
    await this.prisma.childProfile.delete({ where: { id: childId } });
    return { message: 'Child deleted successfully' };
  }
}
