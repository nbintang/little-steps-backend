import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SubmitQuizDto } from '../dto/quiz/submit-quiz.dto';
import { QueryQuizPlayDto, QuerySort } from '../dto/quiz/query-quiz-play.dto';
import { Prisma } from '@prisma/client';
@Injectable()
export class QuizPlayService {
  constructor(private readonly prisma: PrismaService) {}

  async findAllQuizzes(query: QueryQuizPlayDto, childId?: string) {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const searchKeyword = query.keyword;
    const skipCount = (page - 1) * limit;

    // 🟩 Kondisi filter
    const where: Prisma.QuizWhereInput = {
      ...(searchKeyword && {
        OR: [
          { title: { contains: searchKeyword, mode: 'insensitive' } },
          { description: { contains: searchKeyword, mode: 'insensitive' } },
        ],
      }),
      ...(query.category && {
        OR: [
          {
            category: {
              name: { contains: query.category, mode: 'insensitive' },
            },
          },
          {
            category: {
              slug: { contains: query.category, mode: 'insensitive' },
            },
          },
        ],
      }),
    };

    // 🟩 Tentukan urutan (orderBy) berdasarkan QuerySort
    let orderBy: Prisma.QuizOrderByWithRelationInput;
    switch (query.sort) {
      case QuerySort.NEWEST:
        orderBy = { createdAt: 'desc' };
        break;
      case QuerySort.OLDEST:
        orderBy = { createdAt: 'asc' };
        break;
      case QuerySort.HIGHEST_RATED:
        orderBy = { rating: 'desc' };
        break;
      case QuerySort.LOWEST_RATED:
        orderBy = { rating: 'asc' };
        break;
      case QuerySort.RECENTLY_UPDATED:
        orderBy = { updatedAt: 'desc' };
        break;
      case QuerySort.A_TO_Z:
        orderBy = { title: 'asc' };
        break;
      case QuerySort.Z_TO_A:
        orderBy = { title: 'desc' };
        break;
      default:
        orderBy = { createdAt: 'desc' };
    }

    // 🟩 Include relasi yang dibutuhkan
    const include: Prisma.QuizInclude = {
      category: { select: { id: true, slug: true, name: true } },
      questions: { select: { id: true } },
      ...(childId && {
        progress: {
          where: { childId },
          select: {
            id: true,
            score: true,
            completionPercent: true,
            startedAt: true,
            submittedAt: true,
          },
          take: 1,
        },
      }),
    };

    // 🟩 Query data dan total count paralel
    const [quizzes, totalCount] = await Promise.all([
      this.prisma.quiz.findMany({
        where,
        skip: skipCount,
        take: limit,
        orderBy,
        select: {
          id: true,
          title: true,
          rating: true,
          description: true,
          timeLimit: true,
          createdAt: true,
          category: include.category,
          questions: include.questions,
          ...(childId ? { progress: include.progress } : {}),
        },
      }),
      this.prisma.quiz.count({ where }),
    ]);

    // 🟩 Tambahkan metadata progress dan status
    const quizzesWithMeta = quizzes.map((quiz) => {
      const progressForChild = (quiz as any).progress?.[0] ?? null;
      let status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' = 'NOT_STARTED';

      if (!progressForChild) status = 'NOT_STARTED';
      else if (progressForChild.submittedAt) status = 'COMPLETED';
      else status = 'IN_PROGRESS';

      return {
        id: quiz.id,
        title: quiz.title,
        rating: quiz.rating,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        createdAt: quiz.createdAt,
        category: quiz.category,
        questionCount: quiz.questions.length,
        progress: progressForChild
          ? {
              id: progressForChild.id,
              score: progressForChild.score,
              completionPercent: progressForChild.completionPercent,
              startedAt: progressForChild.startedAt,
              submittedAt: progressForChild.submittedAt,
            }
          : null,
        status,
      };
    });

    // 🟩 Response akhir
    return {
      message: 'Berhasil mendapatkan data quiz',
      data: quizzesWithMeta,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalItems: totalCount,
        itemsPerPage: limit,
      },
    };
  }
  async startQuiz(childId: string, quizId: string) {
    const quizExists = await this.prisma.quiz.count({ where: { id: quizId } });
    if (!quizExists) throw new NotFoundException('Quiz not found');
    const existing = await this.prisma.progress.findUnique({
      where: { quizId_childId: { quizId, childId } },
    });
    if (existing) return { message: 'Quiz already started', data: existing };
    const progress = await this.prisma.progress.create({
      data: {
        quizId,
        childId,
        startedAt: new Date(),
        score: 0,
        completionPercent: 0,
      },
    });
    return { message: 'Quiz started now!', data: progress };
  }

  async getQuizForPlay(quizId: string, query: QueryQuizPlayDto) {
    let page = query.page ?? 1;
    let limit = query.limit ?? 10;
    const MAX_LIMIT = 50;
    if (limit > MAX_LIMIT) limit = MAX_LIMIT;
    const quizMeta = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: { id: true, title: true, description: true, timeLimit: true },
    });
    if (!quizMeta) throw new NotFoundException('Quiz not found');
    const totalQuestions = await this.prisma.question.count({
      where: { quizId },
    });
    const totalPages =
      totalQuestions === 0 ? 1 : Math.ceil(totalQuestions / limit);
    if (page > totalPages) page = totalPages;
    const skip = (page - 1) * limit;
    const questions = await this.prisma.question.findMany({
      where: { quizId },
      orderBy: { createdAt: 'asc' },
      skip,
      take: limit,
      select: {
        id: true,
        questionJson: true,
        answers: {
          select: {
            id: true,
            text: true,
            imageAnswer: true,
          },
        },
      },
    });
    const safeQuestions = questions.map((q) => ({
      id: q.id,
      questionJson: q.questionJson,
      timeLimit: quizMeta.timeLimit,
      answers: q.answers.map((a) => ({
        id: a.id,
        text: a.text,
        imageAnswer: a.imageAnswer,
      })),
    }));

    return {
      data: safeQuestions,
      meta: {
        page,
        limit,
        totalQuestions,
        totalPages,
      },
    };
  }
  async getProgress(childId: string, quizId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: { quizId_childId: { quizId, childId } },
    });
    if (!progress) throw new NotFoundException('Progress not found');
    return {
      message: 'Progress found',
      data: progress,
    };
  }
  async submitQuiz(dto: SubmitQuizDto) {
    const { quizId, childId, answers } = dto;
    const quizForScoring = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      select: {
        timeLimit: true,
        questions: {
          select: {
            id: true,
            answers: {
              where: { isCorrect: true },
              select: {
                id: true,
              },
            },
          },
        },
      },
    });

    if (!quizForScoring) throw new NotFoundException('Quiz not found');

    const progress = await this.prisma.progress.findUnique({
      where: { quizId_childId: { quizId, childId } },
    });
    if (!progress) throw new BadRequestException('Quiz not started yet');

    if (progress.submittedAt)
      throw new ConflictException('Quiz already submitted');

    if (quizForScoring.timeLimit) {
      const expiry = new Date(progress.startedAt);
      expiry.setMinutes(expiry.getMinutes() + quizForScoring.timeLimit);
      if (new Date() > expiry) {
        throw new ConflictException('Time is up');
      }
    }

    const correctAnswersMap = new Map<string, string>();
    for (const question of quizForScoring.questions) {
      if (question.answers.length > 0) {
        correctAnswersMap.set(question.id, question.answers[0].id);
      }
    }

    let correctCount = 0;
    const answeredCount = answers.filter(
      (a) => a.selectedAnswerId != null,
    ).length;
    const totalQuestions = quizForScoring.questions.length;

    for (const submittedAnswer of answers) {
      const correctAnswerId = correctAnswersMap.get(submittedAnswer.questionId);
      if (
        correctAnswerId &&
        submittedAnswer.selectedAnswerId === correctAnswerId
      ) {
        correctCount++;
      }
    }

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;
    const completionPercent =
      totalQuestions > 0
        ? Math.round((answeredCount / totalQuestions) * 100)
        : 0;

    const updated = await this.prisma.progress.update({
      where: { quizId_childId: { quizId, childId } },
      data: {
        score,
        completionPercent,
        submittedAt: new Date(),
      },
    });

    return {
      message: 'Quiz submitted successfully',
      data: updated,
    };
  }
}
