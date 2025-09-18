import { ServerResponseDto } from "./server-response.dto";

export class ServerErrorResponseDto {
    statusCode: number;
    message: string;
    success: false;
    errorMessages?: { field: any; message: unknown }[];
} 