import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { GoogleOauthUserResponse } from '../auth/interfaces/google-response.interface';
import { AuthProvider } from '../auth/enums/auth-provider.enum';
import { PrismaService } from '../../common/prisma/prisma.service';
import { QueryUserDto } from './dto/query-user.dto';
import { Prisma } from '@prisma/client';
import { UserRole } from './enums/user-role.enum';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewUser(dto: CreateUserDto) {
    const { name, email, password, acceptedTerms, ...rest } = dto;
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        acceptedTerms,
        acceptedAt: new Date(),
        isRegistered: true,
        provider: AuthProvider.LOCAL,
        providerId: null,
        profile: {
          create: {
            ...rest.profile,
          },
        },
      },
    });
    return newUser;
  }

  async findUsers(query: QueryUserDto) {
    const page = (query.page || 1) - 1;
    const limit = query.limit || 10;
    const skip = page * limit;
    const take = limit;
    const where: Prisma.UserWhereInput = {
      ...(query.keyword && {
        name: { contains: query.keyword, mode: 'insensitive' },
      }),
      role: UserRole.PARENT,
    };
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          name: true,
          email: true,
          verified: true,
          createdAt: true,
          isRegistered: true,
          profile: {
            select: {
              avatarUrl: true,
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      data,
      meta: {
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit,
      },
    };
  }
  async findUserDetails(id: string) {
    return await this.prisma.user.findUnique({
      where: { id, role: UserRole.PARENT },
      select: {
        id: true,
        name: true,
        email: true,
        verified: true,
        isRegistered: true,
        createdAt: true,
        profile: {
          select: {
            id: true,
            fullName: true,
            bio: true,
            birthDate: true,
            avatarUrl: true,
            latitude: true,
            longitude: true,
            phone: true,
          },
        },
      },
    });
  }
  async findUserById(id: string) {
    return await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        verified: true,
        provider: true,
        isRegistered: true,
        profile: { select: { id: true } },
      },
    });
  }

  async findUserByEmail(email: string) {
    return await this.prisma.user.findUnique({ where: { email } });
  }

  async verifyUserByEmail(email: string) {
    const user = await this.prisma.user.update({
      where: { email },
      data: {
        verified: true,
      },
    });
    return user;
  }

  async findUserByGoogleId(googleId: string) {
    return await this.prisma.user.findFirst({
      where: { providerId: googleId },
    });
  }

  async updatePassword(id: string, hashedPassword: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });
  }

  async createUserFromGoogleProvider(gUser: GoogleOauthUserResponse) {
    return await this.prisma.user.create({
      data: {
        email: gUser.email,
        providerId: gUser.googleId,
        name: gUser.name,
        verified: gUser.verified,
        provider: AuthProvider.GOOGLE,
        isRegistered: false,
        acceptedTerms: true,
        acceptedAt: new Date(),
        profile: {
          create: {
            avatarUrl: gUser.avatarUrl,
          },
        },
      },
    });
  }
  async updateUserRegistration(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        isRegistered: true,
      },
      select: { id: true },
    });
  }

  async deleteUser(id: string) {
    const existingUser = await this.findUserById(id);
    if (!existingUser) throw new NotFoundException('User not found');
    await this.prisma.user.delete({
      where: { id },
    });
    return {
      message: 'User deleted successfully',
    };
  }
}
