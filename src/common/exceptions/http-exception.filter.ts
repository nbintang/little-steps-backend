import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  HttpStatus,
  Inject, LoggerService,
  UnauthorizedException
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ServerErrorResponseDto } from '../dto/server-error-response.dto';


@Catch(HttpException)
export class HttpExceptionFilter extends BaseExceptionFilter {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService
  ) {
    super();
  }

  catch(exception: HttpException | UnauthorizedException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response<ServerErrorResponseDto>>();
    const req = ctx.getRequest<Request>();
    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      const validationErrors = (response as any).message;
      const errors = Array.isArray(validationErrors)
        ? validationErrors
        : [(validationErrors as string)];

      const formatted = errors.map((err: any) => {
        if (typeof err === 'string') {
          return { field: '', message: err };
        }
        const firstConstraintMsg = err.constraints
          ? Object.values(err.constraints)[0]
          : 'Invalid value';
        return {
          field: err.property,
          message: firstConstraintMsg,
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
      this.logger.error(`${req.method} ${req.url} 401 Unauthorized: ${exception.message}`);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        statusCode: HttpStatus.UNAUTHORIZED,
        success: false,
        message: exception.message || 'Unauthorized',
      });
    }

    const status = exception instanceof HttpException
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

    this.logger.error(`${req.method} ${req.url} ${status} ${message}`);

    res.status(status).json({
      statusCode: status,
      success: false,
      message,
    });
  }
}
