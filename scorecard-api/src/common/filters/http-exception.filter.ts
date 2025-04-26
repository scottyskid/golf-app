import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Logger } from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal Server Error";

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === "string"
                    ? exceptionResponse
                    : typeof exceptionResponse === "object" && "message" in exceptionResponse
                      ? ((exceptionResponse as Record<string, unknown>).message as string)
                      : exception.message;
        }

        const errorResponse = {
            error: {
                message,
                status,
            },
        };

        // Log the error
        this.logger.error(
            `${request.method} ${request.url} ${status} - ${JSON.stringify(message)}`,
            exception instanceof Error ? exception.stack : "",
        );

        response.status(status).json(errorResponse);
    }
}
