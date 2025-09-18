export class ServerResponseDto<T = any> {
    statusCode: number;
    success: boolean;
    message: string;
    data?: T
}