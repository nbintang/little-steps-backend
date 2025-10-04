import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CreateChildDto } from '../../children/dto/create-child.dto';
import { Request } from 'express';
import { QueryChildDto } from '../../children/dto/query-child.dto';
import { UpdateChildDto } from '../../children/dto/update-child.dto';
import { ParentChildrenService } from '../services/parent-children.service';

@Roles(UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
@Controller('protected/parent/children')
export class ParentChildrenController {
  constructor(private readonly parentService: ParentChildrenService) {}

  @Post()
  async createChildProfile(
    @Body() createChildDto: CreateChildDto,
    @Req() request: Request,
  ) {
    return this.parentService.createChildProfile(
      request.user.sub,
      createChildDto,
    );
  }

  @Get()
  async findAllChildProfile(
    @Req() request: Request,
    @Query() query: QueryChildDto,
  ) {
    const userId = request.user.sub;
    return await this.parentService.findAllChildProfile(userId, query);
  }

  @Get(':childId')
  async findChildProfileById(
    @Req() request: Request,
    @Param('childId') childId: string,
  ) {
    const userId = request.user.sub;
    return await this.parentService.findChildProfileById(userId, childId);
  }

  @Patch(':childId')
  async updateChildProfile(
    @Req() request: Request,
    @Param('childId') childId: string,
    @Body() updateChildDto: UpdateChildDto,
  ) {
    return await this.parentService.updateChildProfile(
      request.user.sub,
      childId,
      updateChildDto,
    );
  }

  @Delete(':childId')
  async deleteChildProfile(
    @Req() request: Request,
    @Param('childId') id: string,
  ) {
    const userId = request.user.sub;
    return this.parentService.deleteChildProfile(userId, id);
  }
}
