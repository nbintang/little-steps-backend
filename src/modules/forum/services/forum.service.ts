import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateForumDto } from '../dto/create-forum.dto';
import { UpdateForumDto } from '../dto/update-forum.dto';
import { QueryForumDto } from '../dto/query-forum.dto';
import { Prisma } from '@prisma/client';
import { ForumSort } from '../enums/forum.enum';

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async createForum(userId: string, createForumDto: CreateForumDto) {
    const thread = await this.prisma.forumThread.create({
      data: {
        title: createForumDto.title,
        description: createForumDto.description,
        author: { connect: { id: userId } }, // ganti createdBy
        category: createForumDto.categoryId
          ? { connect: { id: createForumDto.categoryId } }
          : undefined,
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: { select: { id: true, name: true, slug: true } },
        createdAt: true,
      },
    });

    return { message: 'Thread berhasil dibuat', data: thread };
  }

  async findAllForum(query: QueryForumDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchKeyword = query.keyword;
    const skip = (page - 1) * limit;
    const where: Prisma.ForumThreadWhereInput = {
      ...(searchKeyword && {
        title: { contains: searchKeyword, mode: 'insensitive' },
      }),
      ...(query.userId && { author: { id: query.userId } }),
      ...(query.category && {
        category: {
          OR: [
            { name: { contains: query.category, mode: 'insensitive' } },
            { slug: { contains: query.category, mode: 'insensitive' } },
          ],
        },
      }),
    };
    const orderBy: Prisma.ForumThreadOrderByWithRelationInput =
      query.sort === ForumSort.OLDEST
        ? { createdAt: 'asc' }
        : query.sort === ForumSort.MOST_ACTIVE
          ? { posts: { _count: 'desc' } }
          : query.sort === ForumSort.RECENTLY_UPDATED
            ? { updatedAt: 'desc' }
            : { createdAt: 'desc' }; // default newest

    const [forum, totalCount] = await Promise.all([
      this.prisma.forumThread.findMany({
        where,
        skip,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          description: true,
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          _count: { select: { posts: true } },
          author: {
            select: {
              id: true,
              name: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.forumThread.count({ where }),
    ]);

    const forumMapped = forum.map(({ _count, ...item }) => ({
      ...item,
      postCount: _count.posts,
    }));
    return {
      data: forumMapped,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  }

  async findForumById(id: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        isEdited: true,
        description: true,
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
        createdAt: true,
      },
    });
    if (!thread) throw new NotFoundException('Thread tidak ditemukan');
    return { message: 'Berhasil mengambil thread', data: thread };
  }

  async updateForumById(
    id: string,
    userId: string,
    updateForumDto: UpdateForumDto,
  ) {
    const existingForum = await this.findExistingForumOwner(id);
    if (existingForum.createdBy !== userId) {
      throw new ForbiddenException('Kamu bukan pemilik thread');
    }
    const updatedThread = await this.prisma.forumThread.update({
      where: { id, createdBy: userId },
      data: {
        title: updateForumDto.title,
        isEdited: true,
        description: updateForumDto.description,
        category: { connect: { id: updateForumDto.categoryId } },
      },
      select: {
        id: true,
        title: true,
        description: true,
        category: { select: { id: true, name: true, slug: true } },
        isEdited: true,
        createdAt: true,
      },
    });

    return { message: 'Thread berhasil diperbarui', data: updatedThread };
  }
  async findExistingForumOwner(id: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      select: { createdBy: true },
    });
    return thread;
  }
  async deleteForumById(id: string, userId: string) {
    const existingForum = await this.findExistingForumOwner(id);
    if (existingForum.createdBy !== userId) {
      throw new ForbiddenException('Kamu bukan pemilik thread');
    }
    await this.prisma.forumThread.delete({ where: { id, createdBy: userId } });
    return { message: 'Thread berhasil dihapus' };
  }
}
