import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ChildAccessGuard } from 'src/modules/parent/guards/child-access.guard';
import { ChildrenService } from '../children.service';
import { Request } from 'express';
@UseGuards(ChildAccessGuard)
@Controller('protected/children')
export class ChildrenControllerController {
  constructor(private readonly childrenService: ChildrenService) {}
  @Get('profile')
  @HttpCode(HttpStatus.OK)
  async getChildren(@Req() request: Request) {
    const childId = request.child.childId;
    return await this.childrenService.findChildProfileWithParent(childId);
  }
}
