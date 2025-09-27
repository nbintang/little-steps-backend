import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryContentDto } from './dto/query-content.dto';
import { Prisma } from '@prisma/client';
import { ServerResponseDto } from '../../common/dto/server-response.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}
  async createArticle(createContentDto: CreateContentDto) {
    return 'This action adds a new article';
  }

  async findContents(query: QueryContentDto): Promise<ServerResponseDto> {
    const page = (query.page || 1) - 1;
    const limit = query.limit || 10;
    const skip = page * limit;
    const take = limit;
    const where: Prisma.ContentWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
      ...(query.language && { language: query.language }),
      ...(query.keyword && {
        OR: [
          { title: { contains: query.keyword, mode: 'insensitive' } },
          { excerpt: { contains: query.keyword, mode: 'insensitive' } },
        ],
      }),
    };

    const [data, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          coverImage: true,
          excerpt: true,
          targetAgeMin: true,
          targetAgeMax: true,
          status: true,
          language: true,
          author: {
            select: { id: true, name: true, email: true },
          },
          isPublished: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.content.count({ where }),
    ]);
    return {
      data,
      meta: {
        total,
        page: page + 1,
        limit,
      },
    };
  }

  async findArticleContents(query: QueryContentDto) {
  }

  update(id: number, updateContentDto: UpdateContentDto) {
    return `This action updates a #${id} article`;
  }

  remove(id: number) {
    return `This action removes a #${id} article`;
  }
}
