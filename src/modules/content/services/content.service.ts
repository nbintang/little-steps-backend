import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { QueryContentDto } from '../dto/query-content.dto';
import { ContentStatus, Prisma } from '@prisma/client';
import { ServerResponseDto } from '../../../common/dto/server-response.dto';
import { slugify } from 'transliteration';
import { nanoid } from 'nanoid';
import { RateContentDto } from '../dto/rate-content.dto';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}
  async createContent(
    createContentDto: CreateContentDto,
    query: QueryContentDto,
    authorId: string,
  ) {
    const slug = `${slugify(createContentDto.title)}-${nanoid(5)}`;
    const category = await this.prisma.category.findUnique({
      where: { id: createContentDto.categoryId },
      select: { id: true },
    });
    if (!category) {
      throw new NotFoundException(
        `Category with id ${createContentDto.categoryId} not found`,
      );
    }
    const content = await this.prisma.content.create({
      data: {
        title: createContentDto.title,
        contentJson: createContentDto.contentJson,
        excerpt: createContentDto.excerpt,
        coverImage: createContentDto.coverImage,
        isEdited: false,
        status: createContentDto.status,
        category: { connect: { id: createContentDto.categoryId } },
        type: query.type,
        author: { connect: { id: authorId } },
        slug,
      },
      include: {
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        author: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return {
      data: content,
    };
  }

  async findContents(query: QueryContentDto): Promise<ServerResponseDto> {
    const page = (query.page || 1) - 1;
    const limit = query.limit || 10;
    const skip = page * limit;
    const take = limit;
    const where: Prisma.ContentWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.status && { status: query.status }),
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
          status: true,
          rating: true,
          author: {
            select: { id: true, name: true, email: true },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
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
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
  async findPublishedContent(
    query: QueryContentDto,
  ): Promise<ServerResponseDto> {
    const page = (query.page || 1) - 1;
    const limit = query.limit || 10;
    const skip = page * limit;
    const take = limit;
    const where: Prisma.ContentWhereInput = {
      ...(query.type && { type: query.type }),
      ...(query.keyword && {
        OR: [
          { title: { contains: query.keyword, mode: 'insensitive' } },
          { excerpt: { contains: query.keyword, mode: 'insensitive' } },
        ],
      }),
    };
    const [data, total] = await Promise.all([
      this.prisma.content.findMany({
        where: {
          ...where,
          status: ContentStatus.PUBLISHED,
        },
        skip,
        take,
        select: {
          id: true,
          slug: true,
          title: true,
          type: true,
          coverImage: true,
          excerpt: true,
          status: true,
          rating: true,
          author: {
            select: { id: true, name: true, email: true },
          },
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
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
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }

  async findContentBySlug(slug: string, isPublished?: boolean) {
    const existedContent = await this.findExistedContentBySlug(slug);
    if (!existedContent) throw new NotFoundException('Content not found');
    const content = await this.prisma.content.findUnique({
      where: {
        slug,
        status: isPublished ? ContentStatus.PUBLISHED : undefined,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        coverImage: true,
        excerpt: true,
        status: true,
        rating: true,
        contentJson: true,
        author: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    });
    return {
      data: content,
    };
  }

  async updateContentBySlug(
    updateContentDto: UpdateContentDto,
    query: QueryContentDto,
    slug: string,
  ) {
    const existedContent = await this.findExistedContentBySlug(slug);
    if (!existedContent) throw new NotFoundException('Content not found');

    const data: Prisma.ContentUpdateInput = {
      title: updateContentDto.title,
      excerpt: updateContentDto.excerpt,
      coverImage: updateContentDto.coverImage,
      contentJson: updateContentDto.contentJson,
      status: updateContentDto.status,
      type: query.type,
      isEdited: true,
    };

    if (updateContentDto.categoryId) {
      const category = await this.prisma.category.findUnique({
        where: { id: updateContentDto.categoryId },
        select: { id: true },
      });
      if (!category) {
        throw new NotFoundException(
          `Category with id ${updateContentDto.categoryId} not found`,
        );
      }
      data.category = { connect: { id: updateContentDto.categoryId } };
    }

    if (updateContentDto.title) {
      data.slug = `${slugify(updateContentDto.title, { lowercase: true })}-${nanoid(5)}`;
    }

    const content = await this.prisma.content.update({
      where: { slug },
      data,
      include: {
        category: { select: { id: true, slug: true, name: true } },
        author: { select: { id: true, name: true, email: true } },
      },
    });

    return {
      message: 'Content updated successfully',
      data: content,
    };
  }
  async findExistedContentBySlug(slug: string) {
    return await this.prisma.content.findUnique({
      where: { slug },
      select: { slug: true },
    });
  }

  async deleteContentBySlug(slug: string) {
    const existedContent = await this.findContentBySlug(slug);
    if (!existedContent) throw new NotFoundException('Content not found');
    await this.prisma.content.delete({
      where: { slug },
    });
    return { message: 'Content deleted successfully' };
  }

  async rateContent(slug: string, rate: RateContentDto) {
    const existedContent = await this.findContentBySlug(slug);
    if (!existedContent) throw new NotFoundException('Content not found');
    const content = await this.prisma.content.update({
      where: { slug },
      data: {
        rating: rate.rating,
      },
      select: {
        id: true,
        slug: true,
        title: true,
        type: true,
        status: true,
        excerpt: true,
        rating: true,
      },
    });
    return {
      message: 'Content rated successfully',
      data: content,
    };
  }
}
