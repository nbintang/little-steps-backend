import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserService } from '../user/user.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}
  async completeProfile(dto: CreateProfileDto, userId: string) {
    await this.prisma.profile.create({
      data: {
        ...dto,
        user: { connect: { id: userId } },
      },
    });
    return await this.userService.findUserById(userId);
  }

  async findProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });
    return { data: profile };
  }

  findOne(id: number) {
    return `This action returns a #${id} profile`;
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
