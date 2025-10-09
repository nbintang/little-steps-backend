import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { slugify } from 'transliteration';
import { QueryCategoryDto } from './dto/query-category.dto';
import { Prisma } from '@prisma/client';
import { DeleteCategoriesDto } from './dto/delete-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCategoryDto: CreateCategoryDto) {
    const category = await this.prisma.category.create({
      data: {
        ...createCategoryDto,
        slug: slugify(createCategoryDto.name),
      },
    });
    return { data: category };
  }

  async findAll(query: QueryCategoryDto) {
    const page = (query.page || 1) - 1;
    const limit = query.limit || 10;
    const skip = page * limit;
    const take = limit;
    const where: Prisma.CategoryWhereInput = {
      ...(query.keyword && {
        name: { contains: query.keyword, mode: 'insensitive' },
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        orderBy: { createdAt: 'desc' },
        take,
      }),
      this.prisma.category.count({ where }),
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

  async findOne(id: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: { contents: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return { data: category };
  }

  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.prisma.category.update({
      where: { id },
      data: {
        ...updateCategoryDto,
        slug: updateCategoryDto.name
          ? slugify(updateCategoryDto.name)
          : undefined,
      },
    });
    return { data: category };
  }

  async remove(id: string) {
    const category = await this.prisma.category.delete({ where: { id } });
    return { data: category };
  }

  async removeMany(dto: DeleteCategoriesDto) {
    const deleted = await this.prisma.category.deleteMany({
      where: {
        id: { in: dto.ids },
      },
    });

    return {
      message: `${deleted.count} categories deleted successfully`,
    };
  }
}
