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

@Injectable()
export class ForumService {
  constructor(private readonly prisma: PrismaService) {}

  async createForum(userId: string, createForumDto: CreateForumDto) {
    const thread = await this.prisma.forumThread.create({
      data: {
        title: createForumDto.title,
        createdBy: userId,
      },
      select: {
        id: true,
        title: true,
        // description: true,
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
    };
    const [forum, totalCount] = await Promise.all([
      this.prisma.forumThread.findMany({
        where: {
          ...where,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          // description: true,
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

    return {
      data: forum,
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
        // description: true,
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
      data: { title: updateForumDto.title },
      select: {
        id: true,
        title: true,
        // description: true,
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
