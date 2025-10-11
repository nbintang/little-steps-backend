import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ContentService } from '../services/content.service';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RateContentDto } from '../dto/rate-content.dto';
import { QueryPublicContentDto } from '../dto/query-public-content.dto';
@Controller('contents')
export class PublishedContentController {
  constructor(private readonly contentService: ContentService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async findContents(@Query() query: QueryPublicContentDto) {
    return await this.contentService.findPublishedContent(query);
  }
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findContentBySlug(@Param('slug') slug: string) {
    return await this.contentService.findContentBySlug(slug, true);
  }

  @UseGuards(AccessTokenGuard, VerifyEmailGuard, CompletedProfileGuard)
  @Patch(':slug/rates')
  @HttpCode(HttpStatus.OK)
  async rateContent(@Param('slug') slug: string, @Body() rate: RateContentDto) {
    return await this.contentService.rateContent(slug, rate);
  }
}
