import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

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
        isRegistered: true,
        provider: 'LOCAL',
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
  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
