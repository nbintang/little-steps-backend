import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { ForumService } from '../services/forum.service';
import { CreateForumDto } from '../dto/create-forum.dto';
import { UpdateForumDto } from '../dto/update-forum.dto';
import { UserRole } from '../../user/enums/user-role.enum';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { QueryForumDto } from '../dto/query-forum.dto';
import { Request } from 'express';

@Controller('protected/forum')
export class ForumController {
  constructor(private readonly forumService: ForumService) {}

  @Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Post()
  async createForum(@Body() dto: CreateForumDto, @Req() request: Request) {
    const userId = request.user.sub;
    return await this.forumService.createForum(userId, dto);
  }

  @Get()
  async findAll(@Query() query: QueryForumDto) {
    return await this.forumService.findAllForum(query);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.forumService.findForumById(id);
  }

  @Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Patch(':id')
  async updateForum(
    @Param('id') id: string,
    @Body() dto: UpdateForumDto,
    @Req() request: Request,
  ) {
    return await this.forumService.updateForumById(id, request.user.sub, dto);
  }

  @Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Delete(':id')
  async deleteForum(@Param('id') id: string, @Req() request: Request) {
    return await this.forumService.deleteForumById(id, request.user.sub);
  }
}
