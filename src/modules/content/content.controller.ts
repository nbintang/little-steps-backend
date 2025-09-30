import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
  Get,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { QueryContentDto } from './dto/query-content.dto';
import { AccessTokenGuard } from '../auth/guards/access-token.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { VerifyEmailGuard } from '../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../auth/guards/completed-profile.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../user/enums/user-role.enum';
import { Request } from 'express';

@Roles(UserRole.ADMINISTRATOR, UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('contents')
export class ContentController {
  constructor(private readonly contentService: ContentService) {}
  @Post()
  async createContent(
    @Body() createContentDto: CreateContentDto,
    @Req() request: Request,
    @Query() query: QueryContentDto,
  ) {
    const authorId = await request.user.sub;
    return await this.contentService.createArticle(
      createContentDto,
      query,
      authorId,
    );
  }
  @Get()
  @HttpCode(HttpStatus.OK)
  async findContents(@Query() query: QueryContentDto) {
    return await this.contentService.findContents(query);
  }
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findContentBySlug(@Param('slug') slug: string) {
    return await this.contentService.findContentBySlug(slug);
  }
  @Patch(':slug')
  async updateContentBySlug(
    @Param('slug') slug: string,
    @Query() query: QueryContentDto,
    @Body() updateContentDto: UpdateContentDto,
  ) {
    return await this.contentService.updateContentBySlug(
      updateContentDto,
      query,
      slug,
    );
  }

  @Delete(':slug')
  async deleteContentBySlug(@Param('slug') slug: string) {
    return await this.contentService.deleteContentBySlug(slug);
  }
}
