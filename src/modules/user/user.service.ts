import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { GoogleOauthUserResponse } from '../auth/interfaces/google-response.interface';
import { randomBytes } from 'crypto';
import * as argon2 from 'argon2';
import { AuthProvider } from '../auth/enums/auth-provider.enum';

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

  async findUsers() {
    return await this.prisma.user.findMany();
  }

  async findUserById(id: string) {
    return await this.prisma.user.findUnique({ where: { id } });
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

  async createUserFromGoogleProvider(gUser: GoogleOauthUserResponse) {
    const randomPass = await argon2.hash(randomBytes(12).toString('hex'));
    return await this.prisma.user.create({
      data: {
        email: gUser.email,
        providerId: gUser.googleId,
        name: gUser.name,
        verified: gUser.verified,
        provider: AuthProvider.GOOGLE,
        password: randomPass,
        isRegistered: false,
        acceptedTerms: true,
        acceptedAt: new Date(),
      },
    });
  }
  async updateUserRegistration(id: string) {
    return await this.prisma.user.update({
      where: { id },
      data: {
        isRegistered: true,
      },
    });
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
