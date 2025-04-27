import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { trace, context } from "@opentelemetry/api";
import { OpenTelemetryTransportV3 } from "@opentelemetry/winston-transport";
import { createLogger, format, Logger, transports } from "winston";

import { ILogger } from "./logger.interface";

@Injectable()
export class LoggerService implements ILogger, NestLoggerService {
    private logger: Logger;
    private context!: string;

    constructor(private configService: ConfigService) {
        this.logger = this.createLogger();
    }

    setContext(context: string): void {
        this.context = context;
    }

    debug(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("debug", message, context, meta);
    }

    log(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("info", message, context, meta);
    }

    info(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("info", message, context, meta);
    }

    warn(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("warn", message, context, meta);
    }

    error(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("error", message, context, meta);
    }

    fatal(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("error", message, context, meta);
    }

    verbose(message: string, context?: string, meta?: Record<string, unknown>): void {
        this.logMessage("verbose", message, context, meta);
    }

    private logMessage(level: string, message: string, logContext?: string, meta?: Record<string, unknown>): void {
        const activeContext = context.active();
        const activeSpan = trace.getSpan(activeContext);
        const spanContext = activeSpan?.spanContext();

        this.logger.log({
            level,
            message,
            context: logContext || this.context,
            ...meta,
            traceId: spanContext?.traceId,
            spanId: spanContext?.spanId,
            timestamp: new Date().toISOString(),
        });
    }

    private createLogger(): Logger {
        // TODO: logs - what are these configService value? can they not be hard set?
        const logLevel = this.configService.get<string>("LOG_LEVEL", "info");
        const environment = this.configService.get<string>("NODE_ENV", "development");

        // Define transports based on config
        const logTransports = [];

        // This currently has to be done as the auto instrumentation is not working
        // https://github.com/open-telemetry/opentelemetry-js-contrib/issues/2090
        logTransports.push(new OpenTelemetryTransportV3());

        // TODO: logs - these also seem quite hacky and hardcoded
        // Transports may not need to be set here at all as they can likely be managed by the otel instrumentation
        // Always add console transport
        logTransports.push(
            new transports.Console({
                format:
                    environment === "production" ? format.json() : format.combine(format.colorize(), format.simple()),
            }),
        );

        // Add file transport if configured
        const logToFile = this.configService.get<string>("LOG_TO_FILE", "false") === "true";
        if (logToFile) {
            logTransports.push(
                new transports.File({
                    filename: "logs/error.log",
                    level: "error",
                }),
                new transports.File({
                    filename: "logs/combined.log",
                }),
            );
        }

        return createLogger({
            level: logLevel,
            defaultMeta: {},
            format: format.combine(format.timestamp(), format.json()),
            transports: logTransports,
        });
    }
}
