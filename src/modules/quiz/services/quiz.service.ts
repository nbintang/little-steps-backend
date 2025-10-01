import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateQuizDto } from '../dto/quiz/create-quiz.dto';
import { UpdateQuizDto } from '../dto/quiz/update-quiz.dto';
import { Prisma } from '@prisma/client';
import { QueryQuizDto } from '../dto/quiz/query-quiz.dto';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Membuat quiz baru beserta questions dan answers
   */
  async createQuiz(userId: string, createQuizDto: CreateQuizDto) {
    const { title, description, questions } = createQuizDto;

    const createdQuiz = await this.prisma.quiz.create({
      data: {
        title,
        description,
        createdBy: userId,
        questions: {
          create: questions?.map((question) => ({
            questionJson: question.questionJson,
            answers: {
              create: question.answers.map((answer) => ({
                text: answer.text,
                imageAnswer: answer.imageAnswer,
                isCorrect: answer.isCorrect,
              })),
            },
          })),
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        createdAt: true,
        questions: {
          select: {
            id: true,
            questionJson: true,
            answers: {
              select: {
                id: true,
                text: true,
                imageAnswer: true,
                isCorrect: true,
              },
            },
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
      message: 'Quiz berhasil dibuat',
      data: createdQuiz,
    };
  }

  /**
   * Mendapatkan semua quiz dengan pagination dan filter
   */
  async findAllQuizzes(query: QueryQuizDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchKeyword = query.keyword;
    const userId = query.userId;
    const skipCount = (page - 1) * limit;

    const where: Prisma.QuizWhereInput = {
      ...(searchKeyword && {
        OR: [
          { title: { contains: searchKeyword, mode: 'insensitive' } },
          { description: { contains: searchKeyword, mode: 'insensitive' } },
        ],
      }),
      ...(userId && { createdBy: userId }),
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
          description: true,
          createdAt: true,
          questions: {
            select: {
              id: true,
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

  /**
   * Mendapatkan detail quiz berdasarkan ID
   */
  async findQuizById(quizId: string) {
    const foundQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        author: {
          select: { id: true, name: true, email: true },
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
        createdAt: true,
        updatedAt: true,
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
  async deleteQuiz(quizId: string, userId: string) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    if (existingQuiz.createdBy !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk menghapus quiz ini',
      );
    }

    await this.prisma.quiz.delete({
      where: { id: quizId },
    });

    return {
      message: 'Quiz berhasil dihapus',
    };
  }
}
