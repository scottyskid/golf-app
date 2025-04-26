# Scorecard API

A simplified RESTful API for tracking golf scorecards. This API provides endpoints to manage scorecards with no authentication required.

## Project Structure

This project is organized as follows:

- `src/`: Nest JS TypeScript backend API with collocated test files
- `docker-compose.yml`: Docker configuration for the API and database

## Technologies Used

- Node.js with Express
- TypeScript
- PostgreSQL database
- Prisma ORM
- Docker and Docker Compose

## Getting Started

### Prerequisites

- Docker and Docker Compose installed on your machine

### Running the API

2. Start the application
```bash
docker-compose up
```

This will:
- Start PostgreSQL database
- Set up and start the backend Express API

The API will be available at: http://localhost:3001

To stop the application:
```bash
docker-compose down
```

To rebuild containers after making changes:
```bash
docker-compose up --build
```

## Testing

Tests are collocated with the source code files they test. For example:
- `src/health/health.controller.ts` → `src/health/health.controller.test.ts`
- `src/scorecard/scorecard.service.ts` → `src/scorecard/scorecard.service.test.ts`

To run tests:
```bash
npm test
```

For unit tests only:
```bash
npm run test:unit
```

For integration tests:
```bash
npm run test:integration
```

## License

[MIT](LICENSE)

## Acknowledgements

This project was created as a simplified learning exercise for API development with Express, Prisma, and Docker.
