import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ParentalControlService } from './parental-control.service';
import { CreateParentalControlDto } from './dto/create-parental-control.dto';
import { UpdateParentalControlDto } from './dto/update-parental-control.dto';

@Controller('parental-control')
export class ParentalControlController {
  constructor(private readonly parentalControlService: ParentalControlService) {}

  @Post()
  create(@Body() createParentalControlDto: CreateParentalControlDto) {
    return this.parentalControlService.create(createParentalControlDto);
  }

  @Get()
  findAll() {
    return this.parentalControlService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.parentalControlService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateParentalControlDto: UpdateParentalControlDto) {
    return this.parentalControlService.update(+id, updateParentalControlDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.parentalControlService.remove(+id);
  }
}
