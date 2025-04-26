# Scorecard API

A REST API for tracking and managing golf scorecards. This application allows golfers to record, retrieve, update, and delete their golf scorecard data, including hole-by-hole scores, putts, and fairway hits.

## Technologies

- **Framework**: NestJS
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Testing**: Jest
- **API Documentation**: OpenAPI/Swagger
- **Containerization**: Docker

## Prerequisites

- Node.js (v22.14.0)
- npm (v10.9.2)
- Docker and Docker Compose

## Installation and Setup

1. **Clone the repository**

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   
   Create a `.env` file in the root directory with the following variables:
   ```
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/scorecard?schema=public"
   PORT=3001
   ```

4. **Start the database**
   ```bash
   npm run docker:up
   ```

5. **Generate Prisma client and run migrations**
   ```bash
   npm run prisma:generate
   npm run prisma:migrate
   ```

6. **Build the application**
   ```bash
   npm run build
   ```

7. **Start the application**
   
   For production:
   ```bash
   npm start
   ```

   For development (with live reload):
   ```bash
   npm run dev
   ```

## Testing

- **Run all tests**
  ```bash
  npm test
  ```

- **Run unit tests only**
  ```bash
  npm run test:unit
  ```

- **Run integration tests only**
  ```bash
  npm run test:integration
  ```

- **Generate test coverage report**
  ```bash
  npm run test:coverage
  ```

## API Reference

All endpoints are served at `http://localhost:3001`

### API Documentation

The API is fully documented using OpenAPI/Swagger. You can access the interactive documentation at:

```
http://localhost:3001/api-docs
```

This interface allows you to:
- Browse all available endpoints
- View request/response schemas
- Test API calls directly from the browser
- Download the OpenAPI specification

### Health Check
- **GET** `/health` - Check if the API is running

### Scorecards
- **GET** `/api/v1/scorecard` - Get all scorecards (optional query params: `playerName`, `courseId`)
- **GET** `/api/v1/scorecard/:id` - Get a specific scorecard by ID
- **POST** `/api/v1/scorecard` - Create a new scorecard
- **PUT** `/api/v1/scorecards/:id` - Update a scorecard
- **DELETE** `/api/v1/scorecards/:id` - Delete a scorecard

For detailed request/response formats, see the OpenAPI documentation or [app-spec.md](./app-spec.md).

## Development

### Code Quality

- **Format code**
  ```bash
  npm run format
  ```

- **Lint code**
  ```bash
  npm run lint
  ```

- **Fix lint issues**
  ```bash
  npm run lint:fix
  ```

### Debugging

- **Debug mode**
  ```bash
  npm run debug
  ```

- **Debug with watch mode**
  ```bash
  npm run debug:watch
  ```

### Database Management

- **Generate Prisma client**
  ```bash
  npm run prisma:generate
  ```

- **Run database migrations**
  ```bash
  npm run prisma:migrate
  ```

## Project Structure

```
src/
├── common/        # Common utilities, filters, and pipes
│   ├── filters/   # Exception filters
│   └── swagger/   # OpenAPI/Swagger configuration and models
├── health/        # Health check module
├── prisma/        # Prisma service and module
├── scorecard/     # Scorecard domain (controllers, services, DTOs)
├── tests/         # Test utilities and setup
├── app.module.ts  # Main application module
└── main.ts        # Application entry point
prisma/            # ORM for database schema and migrations
```

## Docker

The application includes Docker Compose configuration for PostgreSQL:

- **Start containers**
  ```bash
  npm run docker:up
  ```

- **Stop containers**
  ```bash
  npm run docker:down
  ```

## License

This project is licensed under the MIT License - see the package.json file for details. 