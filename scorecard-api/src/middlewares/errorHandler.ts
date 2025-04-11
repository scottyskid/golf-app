import { NextFunction, Request, Response } from "express";

/**
 * Custom API Error class that includes status code
 */
export class ApiError extends Error {
    statusCode: number;

    constructor(message: string, statusCode: number) {
        super(message);
        this.statusCode = statusCode;
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

/**
 * Global error handler middleware
 */
export const errorHandler = (err: Error | ApiError, _req: Request, res: Response, _next: NextFunction): void => {
    const status = "statusCode" in err ? err.statusCode : 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        error: {
            message,
            status,
        },
    });
};
