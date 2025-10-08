import {
  Controller,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  Get,
  Query,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/create-post.dto';
import { UpdatePostDto } from '../dto/update-post.dto';
import { UserRole } from '../../user/enums/user-role.enum';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { Request } from 'express';
import { PostService } from '../services/post.service';
import { QueryForumDto } from '../dto/query-forum.dto';

@Controller('protected/forum/:forumId/posts')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @Get()
  async getPostFromForumId(
    @Param('forumId') forumId: string,
    @Query() query: QueryForumDto,
  ) {
    return await this.postService.findAllPosts(forumId, query);
  }

  @Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Post()
  async createPost(
    @Body() dto: CreatePostDto,
    @Param('forumId') forumId: string,
    @Req() request: Request,
  ) {
    return await this.postService.createPost(request.user.sub, forumId, dto);
  }
  @Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Patch(':id')
  async updatePost(
    @Param('id') id: string,
    @Param('forumId') forumId: string,
    @Body() dto: UpdatePostDto,
    @Req() request: Request,
  ) {
    return await this.postService.updatePost(
      id,
      forumId,
      request.user.sub,
      dto,
    );
  }
  @Roles(UserRole.PARENT, UserRole.ADMINISTRATOR)
  @UseGuards(
    AccessTokenGuard,
    RoleGuard,
    VerifyEmailGuard,
    CompletedProfileGuard,
  )
  @Delete(':id')
  async deletePost(
    @Param('id') id: string,
    @Req() request: Request,
    @Param('forumId') forumId: string,
  ) {
    return await this.postService.deletePost(id, forumId, request.user.sub);
  }
}
