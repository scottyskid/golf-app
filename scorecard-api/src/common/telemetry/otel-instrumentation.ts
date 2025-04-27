import { logs } from "@opentelemetry/api-logs";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-grpc";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-grpc";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-grpc";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { LoggerProvider, SimpleLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

import { ATTR_DEPLOYMENT_ENVIRONMENT } from "./semconv";

// Create shared resource attributes
const resource = resourceFromAttributes({
    // These values can be overridden by epecific environment variables
    // or with the env variable `OTEL_RESOURCE_ATTRIBUTES`
    // see https://opentelemetry.io/docs/specs/semconv/
    [ATTR_SERVICE_NAME]: "scorecard-api",
    [ATTR_SERVICE_VERSION]: "0.1.0", // TODO: get version from package.json
    [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
});

// initialize the Logger provider.
// This does not seem supported in the NodeSDK even though there is a param `logRecordProcessor`
// at v0.200.0 so we are doing it this way instead
const loggerProvider = new LoggerProvider();

// Add a processor to export log record to otel collector
// can add in file or console exporter here too if you want to bypass the collector
loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(new OTLPLogExporter()));
logs.setGlobalLoggerProvider(loggerProvider);

// Create and configure the OpenTelemetry SDK
export const otelSDK = new NodeSDK({
    resource: resource,
    traceExporter: new OTLPTraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter(),
        exportIntervalMillis: 15000, // Export metrics every 15 seconds
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            // Enable all auto-instrumentations
            "@opentelemetry/instrumentation-fs": { enabled: true },
            "@opentelemetry/instrumentation-http": { enabled: true },
            "@opentelemetry/instrumentation-express": { enabled: true },
            "@opentelemetry/instrumentation-nestjs-core": { enabled: true },
            "@opentelemetry/instrumentation-winston": { enabled: true },
            "@opentelemetry/instrumentation-pg": { enabled: true },
        }),
    ],
});

// Start logger provider when otel sdk starts
export function startOtelSdk(): void {
    otelSDK.start();
    // Check if OTEL_EXPORTER_OTLP_ENDPOINT environment variable is set
    // this is what determines where the data is exported to
    if (!process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
        console.warn(
            "WARNING: OTEL_EXPORTER_OTLP_ENDPOINT environment variable is not set. OpenTelemetry may not export data correctly.",
        );
    }
}

// Function to shutdown the OpenTelemetry SDK
export function shutdownOtelSdk(): Promise<void> {
    return otelSDK
        .shutdown()
        .then(() => loggerProvider.shutdown())
        .then(() => console.log("Otel terminated"))
        .catch((error) => console.log("Error terminating otel service", error));
}
