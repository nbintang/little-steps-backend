import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateContentDto } from '../dto/create-content.dto';
import { UpdateContentDto } from '../dto/update-content.dto';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { QueryContentDto } from '../dto/query-content.dto';
import { ContentStatus, Prisma } from '@prisma/client';
import { ServerResponseDto } from '../../../common/dto/server-response.dto';
import { slugify } from 'transliteration';
import { nanoid } from 'nanoid';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}
  async createArticle(
    createContentDto: CreateContentDto,
    query: QueryContentDto,
    authorId: string,
  ) {
    const slug = `${slugify(createContentDto.title)}-${nanoid(5)}`;
    const content = await this.prisma.content.create({
      data: {
        ...createContentDto,
        type: query.type,
        author: { connect: { id: authorId } },
        slug,
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
          author: {
            select: { id: true, name: true, email: true },
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
        total,
        page: page + 1,
        limit,
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
          author: {
            select: { id: true, name: true, email: true },
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
        total,
        page: page + 1,
        limit,
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
        contentJson: true,
        author: {
          select: { id: true, name: true, email: true },
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
      ...updateContentDto,
      type: query.type,
    };
    if (updateContentDto.title) {
      data.slug = `${slugify(updateContentDto.title, { lowercase: true })}-${nanoid(5)}`;
      data.isEdited = true;
    }
    const content = await this.prisma.content.update({
      where: { slug },
      data,
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
}
