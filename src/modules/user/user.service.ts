import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}
  async createNewUser(dto: CreateUserDto) {
    const { name, email, password, ...rest } = dto;
    const newUser = await this.prisma.user.create({
      data: {
        name,
        email,
        password,
        profile: {
          ...rest.profile,
          create: {
            address: {
              create: {
                ...rest.address,
              },
            },
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
