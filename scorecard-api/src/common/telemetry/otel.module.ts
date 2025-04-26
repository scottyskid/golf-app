import { Module, OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

import { startOtelSdk, shutdownOtelSdk } from "./otel-instrumentation";

@Module({})
export class TelemetryModule implements OnApplicationBootstrap, OnApplicationShutdown {
    async onApplicationBootstrap() {
        // Start OpenTelemetry SDK when application bootstraps
        startOtelSdk();
    }

    async onApplicationShutdown() {
        // Shutdown OpenTelemetry SDK when application shuts down
        await shutdownOtelSdk();
    }
}
