import { Controller, UseGuards } from '@nestjs/common';
import { ChildAccessGuard } from '../../parent/guards/child-access.guard';

@UseGuards(ChildAccessGuard)
@Controller('children/quizzes')
export class ChildrenQuizController {
  constructor() {}
}
