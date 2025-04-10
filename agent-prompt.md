# Golf Scorecard Web App - Agent Prompt

## Project Overview
This project is a golf scorecard tracking web application with a modern architecture featuring a React-based frontend and Express.js backend. The application allows users to create, track, and analyze golf scorecards.

## Tech Stack

### API
- Express.js as the Node.js framework
- TypeScript for type safety
- PostgreSQL for database
- Prisma as ORM
- JWT for authentication

### Development Tools
- ESLint for code linting
- Prettier for code formatting
- Jest/React Testing Library for testing
- Git for version control

## Project Structure

```
├── golf-scorecard-api/                  # Backend Express application
│   ├── src/
│   │   ├── controllers/     # Route controllers
│   │   ├── middleware/      # Express middleware
│   │   ├── models/          # Data models
│   │   ├── routes/          # Express routes
│   │   ├── services/        # Business logic
│   │   ├── utils/           # Utility functions
│   │   ├── types/           # TypeScript type definitions
│   │   └── app.ts           # Express application setup
│   ├── prisma/              # Prisma schema and migrations
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Key Features to Implement


3. **Scorecard Creation and Tracking**
   - Create new scorecards
   - Track scores per hole

## Data Models


## API Endpoints and Data Models

refer to the app-spec.md file for the specifics of the API endpoints and datamodels

## Development Guidelines

1. Follow a consistent coding style guided by ESLint and Prettier
2. Where possible use the newest stable versions of libaries and dependancies
3. Use somantic versioning for all version and include version numbers in api endpoints
3. Write meaningful commit messages
4. Include proper error handling throughout the application
6. Write unit tests for all functionality
7. Document API endpoints with Swagger
8. Use TypeScript interfaces for all data structures

This prompt can be used as a reference for ensuring consistency in AI-assisted development throughout the project lifecycle. 