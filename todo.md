Uplift
- setup integration and e2e tests
    - confirm test coverage and add more tests to get to 80% coverage
- see how I can encouprate the platform mono repo into my application https://github.com/Eftsure/platform
- implement k8s locally
    - there is a different otel collector for k8s
- understand more about dependancy injection and look to include it in the api potentially
- Error handling and validation
    - Use class-validator and class-transformer (already dependencies) effectively within your DTOs (Data Transfer Objects) in NestJS to validate incoming request bodies and query parameters.
    - Implement consistent error handling. NestJS filters can help centralize error logging and formatting responses (as hinted in app-spec.md).
- add a central service for database connection/auth
    - can we do this for both testing and production?
- add a favicon
- add correlationIds to request headers and include them in logs and traces
- see if logger can log uncaught errors
- update scorecard service to use new logger service
- show application (request) logs in aspire dashboard
- add a seed to the database for dev startup

Working but could be better
- look further into how DB migrations should run, i have currently added a hack into the docker compose that starts the migrations of kickoff
- check against archetectural patterns like clean archetecture
- add authentication to aspire dashboard
- fix metrics being sent to unknown service in aspire dashboard
- clean up endpoints (where should health be? where should version be?)
    - see if nestjs has built in health checks
    - add health check to dockercompose for aspire and otel collector
- is it possible to get hot reloading in the container?
- check for `TODO: logs -` items that I have marked around the place
    - maybe use env var `OTEL_LOG_LEVEL` vs custom defined `LOG_LEVEL` this could allow for different logging to the console vs OTEL
