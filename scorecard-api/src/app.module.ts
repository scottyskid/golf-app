import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

import { HealthModule } from "./health/health.module";
import { PrismaModule } from "./prisma/prisma.module";
import { ScorecardModule } from "./scorecard/scorecard.module";

@Module({
    imports: [ConfigModule.forRoot(), PrismaModule, ScorecardModule, HealthModule],
})
export class AppModule {}
