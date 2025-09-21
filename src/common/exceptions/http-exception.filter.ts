import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  HttpStatus,
  Inject,
  LoggerService,
  UnauthorizedException,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ServerErrorResponseDto } from '../dto/server-error-response.dto';

@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {
    super();
  }

  catch(exception: HttpException | UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response<ServerErrorResponseDto>>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      this.logger.log('Exception response:', JSON.stringify(response, null, 2));

      if (typeof response === 'object' && response['errorMessages']) {
        return res
          .status(HttpStatus.BAD_REQUEST)
          .json(response as ServerErrorResponseDto);
      }

      const validationErrors = (response as any).message;
      const errors = Array.isArray(validationErrors)
        ? validationErrors
        : [validationErrors as string];

      const formatted = errors.flatMap((err: any) => {
        this.logger.log('Processing error:', JSON.stringify(err, null, 2));

        if (typeof err === 'string') {
          return { field: '', message: err };
        }

        if (err.constraints) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          return Object.entries(err.constraints).map(([_, message]) => ({
            field: err.property || '',
            message: message as string,
          }));
        }

        return {
          field: err.property || '',
          message: err.message || 'Invalid value',
        };
      });

      return res.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Validation failed',
        errorMessages: formatted,
      });
    }

    if (exception instanceof UnauthorizedException) {
      this.logger.error(
        `${request.method} ${request.url} 401 Unauthorized: ${exception.message}`,
      );
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        message: exception.message || 'Unauthorized',
      });
    }

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';

    const message =
      typeof responseMessage === 'string'
        ? responseMessage
        : (responseMessage as any)?.message || 'Internal server error';

    this.logger.error(`${request.method} ${request.url} ${status} ${message}`);

    res.status(status).json({
      statusCode: status,
      success: false,
      message,
    });
  }
}
