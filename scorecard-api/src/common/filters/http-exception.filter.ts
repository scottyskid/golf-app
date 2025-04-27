import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { Request, Response } from "express";

import { LoggerService } from "../logger/logger.service";

/**
 * Global exception filter that catches all exceptions thrown in the application.
 *
 * This filter:
 * 1. Catches all unhandled exceptions across the application
 * 2. Standardizes error responses in a consistent JSON format
 * 3. Properly classifies errors with appropriate HTTP status codes
 * 4. Enhances logging with request context and error details
 * 5. Integrates with OpenTelemetry for correlating errors with traces
 * 6. Prevents sensitive error details from leaking to clients
 *
 * @example
 * // Error response format returned to clients:
 * {
 *   "error": {
 *     "message": "Resource not found",
 *     "status": 404
 *   }
 * }
 */
@Catch() // Catches all exceptions without any filter (global)
@Injectable()
export class HttpExceptionFilter implements ExceptionFilter {
    /**
     * Creates an instance of the HttpExceptionFilter.
     *
     * @param logger - The logger service that will be used to log error details
     * with OpenTelemetry integration for distributed tracing
     */
    constructor(private readonly logger: LoggerService) {
        // Set the context for all logs from this filter
        this.logger.setContext(HttpExceptionFilter.name);
    }

    /**
     * Exception handler that processes all caught exceptions.
     *
     * @param exception - The exception object caught by this filter
     * @param host - ArgumentsHost object that holds request/response context
     */
    catch(exception: unknown, host: ArgumentsHost): void {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        // Default to 500 Internal Server Error for unknown exceptions
        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = "Internal Server Error";

        // Handle known HttpExceptions with their specific status codes and messages
        if (exception instanceof HttpException) {
            // Extract the HTTP status code from the exception
            status = exception.getStatus();

            // Extract the error message, handling different response formats
            const exceptionResponse = exception.getResponse();
            message =
                typeof exceptionResponse === "string"
                    ? exceptionResponse
                    : typeof exceptionResponse === "object" && "message" in exceptionResponse
                      ? ((exceptionResponse as Record<string, unknown>).message as string) // Object with message property
                      : exception.message; // Fallback to exception.message
        }

        // Create standardized error response structure
        const errorResponse = {
            error: {
                message,
                status,
            },
        };

        // Log the error with detailed context for troubleshooting
        // This includes HTTP method, URL, status code, and stack trace
        // Integration with OpenTelemetry through LoggerService means these logs
        // will be automatically correlated with traces via trace/span IDs
        this.logger.error(
            `${request.method} ${request.url} ${status} - ${JSON.stringify(message)}`,
            HttpExceptionFilter.name,
            {
                path: request.url,
                method: request.method,
                stack: exception instanceof Error ? exception.stack : undefined,
            },
        );

        // Send the standardized error response to the client
        // The actual stack trace and detailed error info remains server-side only
        response.status(status).json(errorResponse);
    }
}
