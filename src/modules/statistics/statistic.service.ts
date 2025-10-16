import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { Prisma } from '@prisma/client';
import {
  ProgressChartType,
  QueryStatisticQuizDto,
} from './dto/statistic-quiz.dto';

@Injectable()
export class StatisticService {
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
  async getAllQuizProgress(query?: QueryStatisticQuizDto) {
    const {
      type = ProgressChartType.OVERALL,
      start,
      end,
      childId,
      quizId,
      category,
    } = query || {};

    const dateFilter =
      type === ProgressChartType.WEEKLY
        ? { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        : type === ProgressChartType.MONTHLY
          ? { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          : start && end
            ? { gte: new Date(start), lte: new Date(end) }
            : undefined;

    const where: Prisma.ProgressWhereInput = {
      ...(childId && { childId }),
      ...(quizId && { quizId }),
      ...(dateFilter && { startedAt: dateFilter }),
      ...(category && {
        quiz: {
          categoryId: category,
        },
      }),
    };

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

    const chartData = progresses.map((p) => ({
      date: new Date(p.startedAt).toISOString().split('T')[0],
      score: p.score ?? 0,
      completionPercent: p.completionPercent ?? 0,
      quizTitle: p.quiz.title,
      category: p.quiz.category?.name ?? 'Unknown',
      childName: p.child.name,
    }));

    // Tambahkan meta
    const totalScore = progresses.reduce((sum, p) => sum + (p.score ?? 0), 0);
    const avgScore = progresses.length > 0 ? totalScore / progresses.length : 0;
    const totalQuizzes = progresses.length;
    const totalCompletion = progresses.reduce(
      (sum, p) => sum + (p.completionPercent ?? 0),
      0,
    );
    const avgCompletion =
      progresses.length > 0 ? totalCompletion / progresses.length : 0;

    const meta = {
      totalQuizzes,
      totalScore,
      avgScore: parseFloat(avgScore.toFixed(2)),
      avgCompletion: parseFloat(avgCompletion.toFixed(2)),
    };

    return {
      message: 'Progress data found',
      data: chartData,
      meta,
    };
  }
}
