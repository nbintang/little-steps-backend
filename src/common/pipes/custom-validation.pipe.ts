import {
  BadRequestException,
  Injectable,
  ValidationPipe,
  ValidationError,
  ValidationPipeOptions,
} from '@nestjs/common';

@Injectable()
export class CustomValidationPipe extends ValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      ...options,
      exceptionFactory: (validationErrors: ValidationError[]) => {
        const errorMessages = [];

        const processError = (error: ValidationError, parentProperty = '') => {
          const propertyPath = parentProperty
            ? `${parentProperty}.${error.property}`
            : error.property;

          if (error.constraints) {
            Object.values(error.constraints).forEach((message) => {
              errorMessages.push({ field: propertyPath, message });
            });
          }

          if (error.children && error.children.length > 0) {
            error.children.forEach((childError) =>
              processError(childError, propertyPath),
            );
          }
        };

        validationErrors.forEach((error) => processError(error));

        throw new BadRequestException({
          statusCode: 400,
          success: false,
          message: 'Validation failed',
          errorMessages,
        });
      },
    });
  }
}
