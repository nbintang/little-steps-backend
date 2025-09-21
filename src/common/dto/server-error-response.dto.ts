export class ServerErrorResponseDto {
  statusCode: number;
  message: string;
  success: false;
  errorMessages?: Array<{ field: any; message: unknown }>;
}
