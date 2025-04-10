# Scorecard API Specification

## Overview
This document outlines the REST API endpoints for the Golf Scorecard application.

## Base URL
All endpoints are relative to: `http://localhost:3001`

## Authentication
This API does not require authentication.

## Endpoints

### Health Check
- **GET** `/health`
  - Description: Check if the API is running
  - Response: 200 OK with status message

### Scorecards
- **GET** `/api/v1/scorecard`
  - Description: Get all scorecards
  - Query Parameters:
    - `playerName` (optional): Filter by player name
    - `courseId` (optional): Filter by course
  - Response: Array of scorecard objects

- **GET** `/api/v1/scorecard/:id`
  - Description: Get a specific scorecard by ID
  - Response: Scorecard object with hole scores

- **POST** `/api/v1/scorecard`
  - Description: Create a new scorecard
  - Request Body: Scorecard details including hole scores
  - Response: Created scorecard object

- **PUT** `/api/v1/scorecards/:id`
  - Description: Update a scorecard
  - Request Body: Updated scorecard details
  - Response: Updated scorecard object

- **DELETE** `/api/v1/scorecards/:id`
  - Description: Delete a scorecard
  - Response: Deletion confirmation

## Data Models

### Scorecard
```json
{
  "id": "uuid",
  "playerName": "String",
  "courseId": "uuid",
  "date": "DateTime",
  "totalScore": 85,
  "notes": "String (optional)",
  "createdAt": "DateTime",
  "updatedAt": "DateTime",
  "scores": [
    {
      "id": "uuid",
      "scorecardId": "uuid",
      "holeNumber": 1,
      "score": 5,
      "putts": 2,
      "fairwayHit": true
    }
  ]
}
```

## Error Responses
All errors follow a standard format:

```json
{
  "error": true,
  "message": "Description of the error",
  "statusCode": 400
}
```

Common error status codes:
- 400: Bad Request
- 404: Resource Not Found
- 500: Internal Server Error 