import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ChildrenService } from './children.service';
import { CreateChildDto } from './dto/create-child.dto';
import { UpdateChildDto } from './dto/update-child.dto';
import { ChildAccessGuard } from '../parental-control/guards/child-access.guard';
@Controller('children')
export class ChildrenController {
  constructor(private readonly kidService: ChildrenService) {}

  @Post()
  create(@Body() createChildDto: CreateChildDto) {
    return this.kidService.create(createChildDto);
  }

  @UseGuards(ChildAccessGuard)
  @Get('contents')
  findAll() {
    return this.kidService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kidService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateChildDto: UpdateChildDto) {
    return this.kidService.update(+id, updateChildDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kidService.remove(+id);
  }
}
