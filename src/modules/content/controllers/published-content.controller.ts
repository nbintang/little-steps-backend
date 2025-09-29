import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
} from '@nestjs/common';
import { QueryContentDto } from '../dto/query-content.dto';
import { ContentService } from '../services/content.service';

@Controller('contents/published')
export class PublishedContentController {
  constructor(private readonly contentService: ContentService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async findContents(@Query() query: QueryContentDto) {
    return await this.contentService.findContents(query);
  }
  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findContentBySlug(@Param('slug') slug: string) {
    return await this.contentService.findContentBySlug(slug, true);
  }
}
