import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { UpdateQuestionDto } from '../dto/question/update-question.dto';
import { QueryQuizDto } from '../dto/quiz/query-quiz.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Menambahkan question baru ke quiz yang sudah ada
   */
  async addQuestionToQuiz(
    quizId: string,
    createQuestionDto: UpdateQuestionDto,
  ) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    const createdQuestion = await this.prisma.question.create({
      data: {
        quizId,
        questionJson: createQuestionDto.questionJson,
        answers: {
          create: createQuestionDto.answers.map((answer) => ({
            text: answer.text,
            imageAnswer: answer.imageAnswer,
            isCorrect: answer.isCorrect,
          })),
        },
      },
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
    });

    return {
      message: 'Question berhasil ditambahkan ke quiz',
      data: createdQuestion,
    };
  }

  async findQuestionDetailFromQuizById(quizId: string, questionId: string) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId, AND: { quizId } },
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
    });

    if (!question) {
      throw new NotFoundException(
        `Question dengan ID ${questionId} tidak ditemukan`,
      );
    }

    return {
      data: question,
    };
  }

  async findQuestionsfromQuiz(quizId: string, query: QueryQuizDto) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchKeyword = query.keyword;
    const skip = (page - 1) * limit;
    const where: Prisma.QuestionWhereInput = {
      quizId,
      ...(searchKeyword && {
        questionJson: {
          path: ['content', '0', 'content', '0', 'text'],
          string_contains: searchKeyword,
          mode: 'insensitive',
        },
      }),
    };

    const [questions, totalCount] = await Promise.all([
      this.prisma.question.findMany({
        where: {
          ...where,
          quizId,
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'asc' },
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
      }),
      this.prisma.question.count({ where: { quizId } }),
    ]);

    return {
      data: questions,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  }

  async updateQuestionInQuiz(
    quizId: string,
    questionId: string,
    updateQuestionDto: UpdateQuestionDto,
  ) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });
    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    const existingQuestion = await this.prisma.question.findUnique({
      where: { id: questionId },
      select: { quizId: true },
    });
    if (!existingQuestion || existingQuestion.quizId !== quizId) {
      throw new NotFoundException(
        `Question dengan ID ${questionId} tidak ditemukan di quiz ini`,
      );
    }

    // Update question + hapus jawaban lama + buat ulang jawaban
    const updatedQuestion = await this.prisma.question.update({
      where: { id: questionId },
      data: {
        questionJson: updateQuestionDto.questionJson,
        answers: {
          deleteMany: { questionId },
          create: updateQuestionDto.answers.map((answer) => ({
            text: answer.text,
            imageAnswer: answer.imageAnswer,
            isCorrect: answer.isCorrect,
          })),
        },
      },
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
    });

    return {
      message: 'Question berhasil diperbarui',
      data: updatedQuestion,
    };
  }

  /**
   * Menghapus question dari quiz
   */
  async deleteQuestionFromQuiz(quizId: string, questionId: string) {
    const existingQuiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!existingQuiz) {
      throw new NotFoundException(`Quiz dengan ID ${quizId} tidak ditemukan`);
    }

    const existingQuestion = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!existingQuestion || existingQuestion.quizId !== quizId) {
      throw new NotFoundException(
        `Question dengan ID ${questionId} tidak ditemukan di quiz ini`,
      );
    }

    await this.prisma.question.delete({
      where: { id: questionId },
    });

    return {
      message: 'Question berhasil dihapus dari quiz',
    };
  }
}
