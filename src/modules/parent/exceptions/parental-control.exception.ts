import { ForbiddenException } from '@nestjs/common';
import { CurrentAccessWindow } from '../interfaces/current-access.interface';

export class ParentalControlException extends ForbiddenException {
  constructor(allowedWindows: Array<CurrentAccessWindow>) {
    super({
      statusCode: 403,
      success: false,
      message: 'Access restricted by parental control schedule',
      allowedWindows, // <-- array jadwal lengkap
      timestamp: new Date().toISOString(),
    });
  }
}
