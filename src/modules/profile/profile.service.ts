import { Injectable } from '@nestjs/common';
import { CreateProfileDto } from './dto/create-profile.dto';
import { PrismaService } from '../../common/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}
  async completeProfile(dto: CreateProfileDto, userId: string) {
    await this.prisma.profile.update({
      where: { userId },
      data: { ...dto },
    });
    return await this.prisma.user.findUnique({ where: { id: userId } });
  }

  async findProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: {
        id: true,
        fullName: true,
        bio: true,
        birthDate: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return { data: profile };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const { name, ...profileData } = dto;
    const profile = await this.prisma.profile.update({
      where: { userId },
      data: {
        ...profileData,
        user: {
          update: {
            ...(name && { name }),
          },
        },
      },
      select: {
        id: true,
        fullName: true,
        bio: true,
        birthDate: true,
        avatarUrl: true,
        latitude: true,
        longitude: true,
        phone: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return { data: profile };
  }

  remove(id: number) {
    return `This action removes a #${id} profile`;
  }
}
