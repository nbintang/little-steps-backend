import { ForbiddenException } from '@nestjs/common';
import { CurrentAccessWindow } from '../interfaces/current-access.interface';

export class ParentalControlException extends ForbiddenException {
  constructor(allowedWindows: Array<CurrentAccessWindow>) {
    super({
      statusCode: 403,
      success: false,
      message:
        allowedWindows.length > 0
          ? 'Parental control is active'
          : 'Access restricted by parental control schedule, please try again as scheduled time',
      allowedWindows, // <-- array jadwal lengkap;
      timestamp: new Date().toISOString(),
    });
  }
}
