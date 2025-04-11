# Scorecard API Postman Collection

This directory contains a Postman collection for testing the Scorecard API endpoints. The collection includes requests for all available API endpoints.

## Importing the Collection

1. Open Postman
2. Click on the "Import" button in the top left corner
3. Choose "File" and select the `scorecard-api-postman-collection.json` file
4. Click "Import" to add the collection to your Postman workspace

## Configuration

The collection uses a variable `baseUrl` which defaults to `http://localhost:3000`. You can change this value to match your API endpoint:

1. Click on the collection name "Scorecard API Collection" in the sidebar
2. Go to the "Variables" tab
3. Update the "CURRENT VALUE" for `baseUrl` to match your API endpoint
4. Click "Save"

## Available Endpoints

The collection includes the following endpoints:

### Health Check
- `GET {{baseUrl}}/health`
- Checks if the API is running properly

### Scorecard Endpoints
- `GET {{baseUrl}}/api/v1/scorecard` - Get all scorecards (with optional filtering)
- `GET {{baseUrl}}/api/v1/scorecard/:id` - Get a specific scorecard by ID
- `POST {{baseUrl}}/api/v1/scorecard` - Create a new scorecard
- `PUT {{baseUrl}}/api/v1/scorecard/:id` - Update an existing scorecard
- `DELETE {{baseUrl}}/api/v1/scorecard/:id` - Delete a scorecard

## Testing the API

1. Start your Scorecard API server
2. Open the collection in Postman
3. For requests that require an ID (e.g., Get/Update/Delete by ID), you'll need to:
   - First create a scorecard using the "Create New Scorecard" request
   - Copy the returned ID
   - Paste the ID into the URL parameter field for the other requests

## Example Request Bodies

### Create/Update Scorecard
```json
{
  "playerName": "John Doe",
  "courseId": "course-123",
  "date": "2023-08-15T14:30:00Z",
  "totalScore": 72,
  "notes": "Great round!",
  "scores": [
    {
      "holeNumber": 1,
      "score": 4,
      "putts": 2,
      "fairwayHit": true
    },
    {
      "holeNumber": 2,
      "score": 3,
      "putts": 1,
      "fairwayHit": true
    }
  ]
}
``` 