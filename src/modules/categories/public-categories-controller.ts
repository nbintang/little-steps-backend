import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { QueryCategoryDto } from './dto/query-category.dto';

@Controller('categories')
export class PublishedCategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@Query() query: QueryCategoryDto) {
    return this.categoriesService.findAllPublic(query);
  }
}
