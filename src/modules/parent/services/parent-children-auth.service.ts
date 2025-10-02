import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../../common/prisma/prisma.service';
import { ChildJwtPayload } from '../interfaces/child-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '../../../config/config.service';

@Injectable()
export class ParentChildrenAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async signChildToken(parentId: string, childId: string) {
    const child = await this.prisma.childProfile.findUnique({
      where: { id: childId },
      select: { id: true, parentId: true },
    });
    if (!child || child.parentId !== parentId) {
      throw new ForbiddenException('Child not found or not owned by you');
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
