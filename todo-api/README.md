# Todo API

A simple RESTful API for a Todo application built with TypeScript, Express, and PostgreSQL.

## Features

- Create new todo items
- List all todo items
- Docker containerization
- PostgreSQL database

## Tech Stack

- Node.js
- TypeScript
- Express.js
- PostgreSQL
- TypeORM
- Docker

## Prerequisites

- Docker and Docker Compose

## Getting Started

### Running with Docker Compose

1. Clone the repository
2. Navigate to the project directory
3. Run the application with Docker Compose:

```bash
docker-compose up -d
```

This will start both the API and PostgreSQL containers.

### API Endpoints

- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create a new todo
- `GET /health` - Health check endpoint

### Example API Requests

#### Get all todos

```bash
curl -X GET http://localhost:3000/api/todos
```

#### Create a new todo

```bash
curl -X POST http://localhost:3000/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

## Development

### Running locally

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

### Building the application

```bash
npm run build
```

### Running the built application

```bash
npm start
```

## Project Structure

```
todo-api/
├── src/
│   ├── config/         # Configuration files
│   ├── controllers/    # Request handlers
│   ├── models/         # Data models
│   ├── routes/         # API routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── app.ts          # Application entry point
├── .env                # Environment variables
├── docker-compose.yml  # Docker Compose configuration
├── Dockerfile          # Docker configuration
├── package.json        # Project dependencies
└── tsconfig.json       # TypeScript configuration
``` 