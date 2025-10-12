import { PrismaService } from '../../../common/prisma/prisma.service';
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { QueryForumDto } from '../dto/query-forum.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllPosts(threadId: string, query: QueryForumDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchKeyword = query.keyword;
    const skip = (page - 1) * limit;
    const where: Prisma.ForumPostWhereInput = {
      ...(searchKeyword && {
        content: { contains: searchKeyword, mode: 'insensitive' },
      }),
      threadId,
    };
    const [posts, totalCount] = await Promise.all([
      this.prisma.forumPost.findMany({
        where: {
          ...where,
        },
        skip,
        take: limit,
        orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
        select: {
          id: true,
          content: true,
          createdAt: true,
          isEdited: true,
          author: {
            select: {
              id: true,
              name: true,
              profile: { select: { avatarUrl: true } },
            },
          },
        },
      }),
      this.prisma.forumPost.count({ where }),
    ]);

    return {
      data: posts,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  }
  async createPost(
    userId: string,
    threadId: string,
    createPostDto: CreatePostDto,
  ) {
    const post = await this.prisma.forumPost.create({
      data: {
        ...createPostDto,
        threadId,
        authorId: userId,
      },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });
    return { message: 'Post berhasil dibuat', data: post };
  }

  async updatePost(
    id: string,
    threadId: string,
    userId: string,
    updatePostDto: UpdatePostDto,
  ) {
    const existingPost = await this.findExistingPostById(id);
    if (!existingPost) throw new NotFoundException('Post tidak ditemukan');
    if (existingPost.authorId !== userId) throw new ForbiddenException();
    const updatedPost = await this.prisma.forumPost.update({
      where: { id, threadId },
      data: { content: updatePostDto.content, isEdited: true },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });

    return { message: 'Post berhasil diperbarui', data: updatedPost };
  }

  async findPostById(id: string, threadId: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id, threadId },
      select: {
        id: true,
        content: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            profile: { select: { avatarUrl: true } },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Post tidak ditemukan');
    return { message: 'Berhasil mengambil post', data: post };
  }

  async findExistingPostById(id: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id },
      select: { id: true, authorId: true },
    });
    return post;
  }

  async deletePost(id: string, threadId: string, userId: string) {
    const existingPost = await this.findExistingPostById(id);
    if (!existingPost) throw new NotFoundException('Post tidak ditemukan');
    if (existingPost.authorId !== userId) throw new ForbiddenException();
    await this.prisma.forumPost.delete({ where: { id, threadId } });
    return { message: 'Post berhasil dihapus' };
  }
}
