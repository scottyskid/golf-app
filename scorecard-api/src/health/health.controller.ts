import { Controller, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";

@ApiTags("health")
@Controller("health")
export class HealthController {
    @ApiOperation({ summary: "Health check", description: "Check if the API is running properly" })
    @ApiResponse({
        status: 200,
        description: "API is healthy",
        schema: {
            type: "object",
            properties: {
                status: {
                    type: "string",
                    example: "OK",
                },
            },
        },
    })
    @Get()
    healthCheck(): { status: string } {
        return { status: "OK" };
    }
}
