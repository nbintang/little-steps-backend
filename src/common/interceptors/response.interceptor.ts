import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  LoggerService,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { ServerResponseDto } from '../dto/server-response.dto';

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
    const request = ctx.switchToHttp().getRequest();
    const { method, url } = request;
    const start = Date.now();

    return next.handle().pipe(
      map((result): ServerResponseDto => {
        const res = ctx.switchToHttp().getResponse();
        const statusCode = res.statusCode;

        const baseResponse: ServerResponseDto = {
          statusCode: (result as any)?.statusCode ?? statusCode,
          success: (result as any)?.success ?? true,
          message: (result as any)?.message ?? 'Success',
        };

        const isObject = result !== null && typeof result === 'object';

        let data: any;
        if (isObject && 'data' in result) {
          data = (result as any).data;
        } else if (Array.isArray(result)) {
          data = result;
        } else if (!isObject && result !== undefined) {
          data = result;
        }

        const elapsed = Date.now() - start;
        this.logger.log(
          'info',
          JSON.stringify({
            method,
            url,
            statusCode: baseResponse.statusCode,
            durationMs: `${elapsed}ms`,
            message: baseResponse.message,
            hasData: Boolean(data),
          }),
        );

        return data !== undefined ? { ...baseResponse, data } : baseResponse;
      }),
    );
  }
}
