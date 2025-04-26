import { Module, INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

@Module({})
export class SwaggerDocModule {
    /**
     * Setup Swagger documentation for the application
     */
    static setup(app: INestApplication): void {
        // Create the Swagger document builder
        const config = new DocumentBuilder()
            .setTitle("Golf Scorecard API")
            .setDescription("API for tracking golf scorecards")
            .setVersion("1.0")
            .addTag("scorecard")
            .addTag("health")
            .addBearerAuth() // Add this for future authentication
            .build();

        // Create the Swagger document
        const document = SwaggerModule.createDocument(app, config);

        // Setup the Swagger UI endpoint
        SwaggerModule.setup("docs", app, document, {
            swaggerOptions: {
                tagsSorter: "alpha",
                operationsSorter: "alpha",
                docExpansion: "list",
            },
        });
    }
}
