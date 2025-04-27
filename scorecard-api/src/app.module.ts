import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { LoggerModule } from "./common/logger/logger.module";
import { TelemetryModule } from "./common/telemetry/otel.module";
import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScorecardModule } from "./scorecard/scorecard.module";

@Module({
    imports: [ConfigModule.forRoot(), TelemetryModule, LoggerModule, PrismaModule, ScorecardModule, HealthModule],
    providers: [HttpExceptionFilter],
})
export class AppModule {}
