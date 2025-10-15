// src/modules/quiz/quiz.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { QueryProgressDto, ProgressChartType } from './dto/progress-quiz.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}
  async getProgress(childId: string, quizId: string) {
    const progress = await this.prisma.progress.findUnique({
      where: { quizId_childId: { quizId, childId } },
      select: {
        id: true,
        score: true,
        completionPercent: true,
        startedAt: true,
        submittedAt: true,
        child: { select: { id: true, name: true } },
        quiz: {
          select: {
            id: true,
            title: true,
            category: { select: { id: true, slug: true, name: true } },
          },
        },
      },
    });

    if (!progress) throw new NotFoundException('Progress not found');

    // buat data chart sederhana
    const chartData = [
      { label: 'Completion', value: progress.completionPercent || 0 },
      { label: 'Score', value: progress.score || 0 },
    ];

    return {
      message: 'Progress found',
      data: {
        ...progress,
        chart: chartData,
      },
    };
  }

  async getAllProgress(query?: QueryProgressDto) {
    const {
      type = ProgressChartType.OVERALL,
      start,
      end,
      childId,
      quizId,
    } = query || {};

    // filter waktu opsional
    const dateFilter =
      type === ProgressChartType.WEEKLY
        ? { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        : type === ProgressChartType.MONTHLY
          ? { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          : start && end
            ? { gte: new Date(start), lte: new Date(end) }
            : undefined;

    const where: Prisma.ProgressWhereInput = {};
    if (childId) where.childId = childId;
    if (quizId) where.quizId = quizId;
    if (dateFilter) where.startedAt = dateFilter;

    const progresses = await this.prisma.progress.findMany({
      where,
      select: {
        id: true,
        score: true,
        completionPercent: true,
        startedAt: true,
        submittedAt: true,
        child: { select: { id: true, name: true } },
        quiz: {
          select: {
            id: true,
            title: true,
            category: { select: { id: true, slug: true, name: true } },
          },
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    if (progresses.length === 0) {
      throw new NotFoundException('No progress data found');
    }

    const chartData = progresses.map((p) => ({
      date: p.startedAt,
      score: p.score || 0,
      completion: p.completionPercent || 0,
      quizTitle: p.quiz.title,
    }));

    return {
      message: 'Progress data found',
      data: progresses,
      chart: chartData,
    };
  }
}
