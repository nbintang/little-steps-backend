export class ServerResponseDto<T = Array<object> | object> {
  statusCode: number;
  success: boolean;
  message: string;
  data?: T;
}
