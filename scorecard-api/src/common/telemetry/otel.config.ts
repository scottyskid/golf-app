import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } from "@opentelemetry/semantic-conventions";

import { ATTR_DEPLOYMENT_ENVIRONMENT } from "./semconv";

// Configure the OTLP endpoint URL
const OTEL_COLLECTOR_URL = process.env.OTEL_COLLECTOR_URL || "http://otel-collector:4318";

// Create and configure the OpenTelemetry SDK
export const otelSDK = new NodeSDK({
    resource: resourceFromAttributes({
        [ATTR_SERVICE_NAME]: "scorecard-api",
        [ATTR_SERVICE_VERSION]: "0.1.0",
        [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    }),
    traceExporter: new OTLPTraceExporter({
        url: `${OTEL_COLLECTOR_URL}/v1/traces`,
    }),
    metricReader: new PeriodicExportingMetricReader({
        exporter: new OTLPMetricExporter({
            url: `${OTEL_COLLECTOR_URL}/v1/metrics`,
        }),
        exportIntervalMillis: 15000, // Export metrics every 15 seconds
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            // Enable all auto-instrumentations
            "@opentelemetry/instrumentation-fs": { enabled: true },
            "@opentelemetry/instrumentation-http": { enabled: true },
            "@opentelemetry/instrumentation-express": { enabled: true },
            "@opentelemetry/instrumentation-nestjs-core": { enabled: true },
        }),
    ],
});

// Function to start the OpenTelemetry SDK
export function startOtelSdk() {
    otelSDK.start();
}

// Function to shutdown the OpenTelemetry SDK
export function shutdownOtelSdk() {
    return otelSDK
        .shutdown()
        .then(() => console.log("Tracing terminated"))
        .catch((error) => console.log("Error terminating tracing", error));
}
