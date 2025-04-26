import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";

import { AppModule } from "./app.module";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { SwaggerDocModule } from "./common/swagger/swagger.module";

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);

    // Global validation pipe
    app.useGlobalPipes(new ValidationPipe({ transform: true }));

    // Global exception filter
    app.useGlobalFilters(new HttpExceptionFilter());

    // Enable CORS
    app.enableCors();

    // API prefix
    app.setGlobalPrefix("api/v1");

    // Set up Swagger documentation
    SwaggerDocModule.setup(app);

    // Start server
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`Server running on port ${port}`);
    console.log(`OpenAPI documentation available at http://localhost:${port}/docs`);
}

bootstrap();
