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
    const res = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const responseMessage =
      exception instanceof HttpException
        ? exception.getResponse()
        : 'Internal server error';
    let responseBody: any;

    if (typeof responseMessage === 'object') {
      responseBody = {
        statusCode: status,
        success: false,
        timestamp: new Date().toISOString(),
        path: request.url,
        ...responseMessage,
      };
    } else {
      responseBody = {
        statusCode: status,
        success: false,
        message: responseMessage,
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();
      const validationErrors = (response as any)?.message;
      const errors = Array.isArray(validationErrors)
        ? validationErrors
        : [validationErrors].filter(Boolean);
      responseBody = {
        statusCode: HttpStatus.BAD_REQUEST,
        success: false,
        message: 'Validation failed',
        errorMessages: errors
          .map((err: any) => {
            if (typeof err === 'string') return { field: '', message: err };
            if (err.constraints)
              return Object.values(err.constraints).map((message) => ({
                field: err.property || '',
                message,
              }));
            return {
              field: err.property || '',
              message: err.message || 'Invalid value',
            };
          })
          .flat(),
        timestamp: new Date().toISOString(),
        path: request.url,
      };
    }
    this.logger.error(
      `${request.method} ${request.url} ${status} ${JSON.stringify(responseBody)}`,
    );
    res.status(status).json(responseBody);
  }
}
