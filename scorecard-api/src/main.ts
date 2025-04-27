import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggerService } from "./common/logger/logger.service";
import { SwaggerDocModule } from "./common/swagger/swagger.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        bufferLogs: true,
    });

    // Get LoggerService from DI container
    const logger = app.get(LoggerService);
    logger.setContext("Bootstrap");

    // Use our logger for application logging
    app.useLogger(logger);

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Global exception filter
    const exceptionFilter = app.get(HttpExceptionFilter);
    app.useGlobalFilters(exceptionFilter);

    // Enable CORS
    app.enableCors();

    // API prefix
    app.setGlobalPrefix("api/v1");

    // Set up Swagger documentation
    SwaggerDocModule.setup(app);

    // Start server
    const port = process.env.PORT || 3000;
    await app.listen(port);
    logger.info(`Server running on port ${port}`);
    logger.info(`OpenAPI documentation available at http://localhost:${port}/docs`);

    // Handle graceful shutdown
    const signals = ["SIGTERM", "SIGINT"];
    for (const signal of signals) {
        process.on(signal, async () => {
            logger.info(`Received ${signal}, shutting down gracefully...`);
            await app.close();
            logger.info("HTTP server closed");
            process.exit(0);
        });
    }
}

bootstrap();
