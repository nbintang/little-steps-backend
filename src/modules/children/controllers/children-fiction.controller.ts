import { Controller, UseGuards } from '@nestjs/common';
import { ChildrenService } from '../children.service';

import { ChildAccessGuard } from '../../parent/guards/child-access.guard';

@UseGuards(ChildAccessGuard)
@Controller('children/content/fiction')
export class ChildrenFictionController {
  constructor(private readonly kidService: ChildrenService) {}
}
