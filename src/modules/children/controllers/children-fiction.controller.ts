import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChildAccessGuard } from '../../parent/guards/child-access.guard';
import { ContentService } from '../../content/services/content.service';
import { QueryContentDto } from '../../content/dto/query-content.dto';
import { ContentType } from '../../content/enums/content.enum';

@UseGuards(ChildAccessGuard)
@Controller('protected/children/contents/fictions')
export class ChildrenFictionController {
  constructor(private readonly contentService: ContentService) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async findContentFictions(@Query() query: QueryContentDto) {
    return await this.contentService.findPublishedContent({
      type: ContentType.FICTION_STORY,
      ...query,
    });
  }

  @Get(':slug')
  @HttpCode(HttpStatus.OK)
  async findContentFictionBySlug(@Param('slug') slug: string) {
    return await this.contentService.findContentBySlug(slug, true);
  }
}
