/*
 * According to the OpenTelemetry Semantic Conventions, documentation
 * https://github.com/open-telemetry/opentelemetry-js/blob/main/semantic-conventions/README.md#unstable-semconv
 *
 * Because the "incubating" entry-point may include breaking changes in minor versions,
 * it is recommended that instrumentation libraries not import @opentelemetry/semantic-conventions/incubating
 * in runtime code, but instead copy relevant definitions into their own code base.
 *
 * We define the following attributes for our own use.
 */
export const ATTR_DEPLOYMENT_ENVIRONMENT = "deployment.environment.name";
