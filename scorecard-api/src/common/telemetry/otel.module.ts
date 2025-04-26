import { OnApplicationBootstrap, OnApplicationShutdown } from "@nestjs/common";

// import { OpenTelemetryModule } from '@nestjs/opentelemetry';
import { startOtelSdk, shutdownOtelSdk } from "./otel.config";

// @Module({
//   imports: [
//     OpenTelemetryModule.forRoot({
//       metrics: {
//         hostMetrics: true,
//         apiMetrics: {
//           enable: true,
//           timeBuckets: [0.01, 0.05, 0.1, 0.5, 1, 5],
//           defaultAttributes: {
//             custom_attribute: 'scorecard-api',
//           },
//         },
//       },
//     }),
//   ],
// })
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
