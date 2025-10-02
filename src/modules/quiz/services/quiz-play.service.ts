// src/modules/quiz/quiz.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { SubmitQuizDto } from '../dto/quiz/submit-quiz.dto';
import { QueryQuizPlayDto } from '../dto/quiz/query-quiz-play.dto';

@Injectable()
export class QuizPlayService {
  constructor(private readonly prisma: PrismaService) {}

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
