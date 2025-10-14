import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ChildJwtPayload } from '../interfaces/child-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../config/config.service';
import { ParentalControlScheduleService } from './parental-control-schedule.service';

@Injectable()
export class ParentChildrenAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly scheduleService: ParentalControlScheduleService,
  ) {}

  async signChildToken(parentId: string, childId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childId },
      select: { id: true, parentId: true },
    });

    if (!child || child.parentId !== parentId) {
      throw new ForbiddenException('Child not found or not owned by you');
    }

    // 🔒 Cek apakah anak punya jadwal
    const hasSchedule = await this.prisma.parentalControlSchedule.count({
      where: { childId },
    });

    if (hasSchedule === 0) {
      throw new ForbiddenException(
        'No schedule found. Please create a schedule first.',
      );
    }

    // ⏰ Cek apakah saat ini anak diperbolehkan akses
    const isAllowed = await this.scheduleService.isChildAllowed(childId);
    if (!isAllowed) {
      throw new ForbiddenException(
        'Access denied. Not within allowed schedule time.',
      );
    }

    const payload: ChildJwtPayload = {
      childId: child.id,
      parentId: child.parentId,
    };

    return this.jwtService.signAsync(payload, {
      secret: this.configService.jwt.childSecret,
      expiresIn: '12h',
    });
  }
  async getChildFromToken(token: string) {
    const payload = await this.jwtService.verifyAsync<ChildJwtPayload>(token, {
      secret: this.configService.jwt.childSecret,
    });
    return payload;
  }
}
