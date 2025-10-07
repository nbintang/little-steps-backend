import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { CreateQuizDto } from '../dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '../dto/quiz/update-quiz.dto';
import { Prisma } from '@prisma/client';
import { QueryQuizDto } from '../dto/quiz/query-quiz.dto';
import { RateQuizDto } from '../dto/quiz/rate-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}
  async createQuiz(userId: string, createQuizDto: CreateQuizDto) {
    const { title, description, duration, categoryId } = createQuizDto;
    const createdQuiz = await this.prisma.quiz.create({
      data: {
        title,
        description,
        category: categoryId ? { connect: { id: categoryId } } : undefined,
        author: {
          connect: { id: userId },
        },
        timeLimit: duration,
      },
      select: {
        id: true,
        title: true,
        description: true,
        timeLimit: true,
        rating: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        createdAt: true,
      },
    });
    return {
      message: 'Quiz berhasil dibuat',
      data: createdQuiz,
    };
  }

  async findAllQuizzes(query: QueryQuizDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchKeyword = query.keyword;
    const skipCount = (page - 1) * limit;

    const where: Prisma.QuizWhereInput = {
      ...(searchKeyword && {
        OR: [
          { title: { contains: searchKeyword, mode: 'insensitive' } },
          { description: { contains: searchKeyword, mode: 'insensitive' } },
        ],
      }),
    };
    const [quizzes, totalCount] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip: skipCount,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          rating: true,
          description: true,
          timeLimit: true,
          createdAt: true,
          category: {
            select: {
              id: true,
              slug: true,
              name: true,
            },
          },
          questions: {
            select: {
              id: true,
            },
          },
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    const quizzesWithQuestionCount = quizzes.map((quiz) => ({
      ...quiz,
      questionCount: quiz.questions.length,
      questions: undefined,
    }));

    return {
      message: 'Berhasil mendapatkan data quiz',
      data: quizzesWithQuestionCount,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  }
  async findQuizById(quizId: string) {
    const foundQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        id: true,
        title: true,
        description: true,
        rating: true,
        timeLimit: true,
        createdAt: true,
        category: {
          select: {
            id: true,
            slug: true,
            name: true,
          },
        },
      },
    });

    if (!foundQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    return {
      message: 'Berhasil mendapatkan detail quiz',
      data: foundQuiz,
    };
  }

  /**
   * Mengupdate quiz berdasarkan ID
   */
  async updateQuiz(quizId: string, updateQuizDto: UpdateQuizDto) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    const { title, description } = updateQuizDto;

    const updatedQuiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        title,
        description,
      },
      select: {
        id: true,
        title: true,
        description: true,
        rating: true,
        createdAt: true,
        updatedAt: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
    return {
      message: 'Quiz berhasil diupdate',
      data: updatedQuiz,
    };
  }

  /**
   * Menghapus quiz berdasarkan ID
   */
  async deleteQuiz(quizId: string) {
    const existingQuiz = await this.findExistingQuiz(quizId);

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });

    return {
      message: 'Quiz berhasil dihapus',
    };
  }

  async findExistingQuiz(quizId: string) {
    return await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, createdBy: true },
    });
  }

  async rateQuiz(rateQuizDto: RateQuizDto, quizId: string) {
    const existingQuiz = await this.findExistingQuiz(quizId);

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    const { rating } = rateQuizDto;

    const updatedQuiz = await this.prisma.quiz.update({
      where: { id: quizId },
      data: {
        rating,
      },
      select: {
        id: true,
        title: true,
        rating: true,
      },
    });
    return {
      message: 'Quiz berhasil dirate',
      data: updatedQuiz,
    };
  }
}
