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
  Res,
} from '@nestjs/common';
import { AccessTokenGuard } from '../../auth/guards/access-token.guard';
import { RoleGuard } from '../../auth/guards/role.guard';
import { VerifyEmailGuard } from '../../auth/guards/verify-email.guard';
import { CompletedProfileGuard } from '../../auth/guards/completed-profile.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '../../user/enums/user-role.enum';
import { CreateChildDto } from '../../children/dto/create-child.dto';
import { Request, Response } from 'express';
import { QueryChildDto } from '../../children/dto/query-child.dto';
import { UpdateChildDto } from '../../children/dto/update-child.dto';
import { ParentChildrenService } from '../services/parent-children.service';
import { ParentalControlScheduleService } from '../services/parental-control-schedule.service';

@Controller('parent')
@Roles(UserRole.PARENT)
@UseGuards(AccessTokenGuard, RoleGuard, VerifyEmailGuard, CompletedProfileGuard)
export class ParentChildrenController {
  constructor(
    private readonly parentService: ParentChildrenService,
    private readonly parentalControlScheduleService: ParentalControlScheduleService,
  ) {}

  @Post('children')
  async createChildProfile(
    @Body() createChildDto: CreateChildDto,
    @Req() request: Request,
  ) {
    return this.parentService.createChildProfile(
      request.user.sub,
      createChildDto,
    );
  }

  @Get('children')
  async findAllChildProfile(
    @Req() request: Request,
    @Query() query: QueryChildDto,
  ) {
    const userId = request.user.sub;
    return await this.parentService.findAllChildProfile(userId, query);
  }

  @Get('children/:childId')
  async findChildProfileById(
    @Req() request: Request,
    @Param('childId') childId: string,
  ) {
    const userId = request.user.sub;
    return await this.parentService.findChildProfileById(userId, childId);
  }

  @Patch('children/:childId')
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

  @Delete('children/:childId')
  async deleteChildProfile(
    @Req() request: Request,
    @Param('childId') id: string,
  ) {
    const userId = request.user.sub;
    return this.parentService.deleteChildProfile(userId, id);
  }

  @Post('children/:childId/access')
  async accessChild(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('childId') childId: string,
  ) {
    const userId = request.user.sub;
    const token = await this.parentalControlScheduleService.signChildToken(
      userId,
      childId,
    );

    response.cookie('childToken', token, {
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24, // 12 hours
    });

    return { message: 'Child access granted', data: { childToken: token } };
  }
}
