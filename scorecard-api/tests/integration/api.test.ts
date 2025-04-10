import request from 'supertest';
import { app } from '../../src/app';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

describe('Scorecard API Integration Tests', () => {
  // Test data
  let testScorecardId: string;
  const testScorecard = {
    playerName: 'Integration Test Player',
    courseId: uuidv4(),
    date: new Date().toISOString(),
    totalScore: 72,
    notes: 'Integration test round',
    scores: [
      {
        holeNumber: 1,
        score: 4,
        putts: 2,
        fairwayHit: true
      },
      {
        holeNumber: 2,
        score: 3,
        putts: 1,
        fairwayHit: true
      }
    ]
  };

  beforeAll(async () => {
    // Connect to the database
    await prisma.$connect();
    
    // Clean any test data that might exist from previous test runs
    await prisma.scorecard.deleteMany({
      where: {
        playerName: 'Integration Test Player'
      }
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (testScorecardId) {
      await prisma.scorecard.delete({
        where: { id: testScorecardId }
      }).catch(() => {
        // Ignore error if the scorecard was already deleted
      });
    }
    
    // Disconnect from the database
    await prisma.$disconnect();
  });

  describe('Health Check', () => {
    it('GET /health should return 200 OK', async () => {
      const response = await request(app)
        .get('/health')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('status');
      expect(response.body.status).toBe('OK');
    });
  });

  describe('Scorecard CRUD Operations', () => {
    it('should create a new scorecard (POST /api/v1/scorecard)', async () => {
      const response = await request(app)
        .post('/api/v1/scorecard')
        .send(testScorecard)
        .expect('Content-Type', /json/)
        .expect(201);
      
      // Save the created scorecard ID for later tests
      testScorecardId = response.body.id;
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.playerName).toBe(testScorecard.playerName);
      expect(response.body.totalScore).toBe(testScorecard.totalScore);
      expect(response.body).toHaveProperty('scores');
      expect(response.body.scores.length).toBe(2);
    });

    it('should get all scorecards (GET /api/v1/scorecard)', async () => {
      const response = await request(app)
        .get('/api/v1/scorecard')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      // At least our test scorecard should be present
      expect(response.body.length).toBeGreaterThan(0);
      
      // Check if our test scorecard is in the response
      const found = response.body.some((card: any) => card.id === testScorecardId);
      expect(found).toBe(true);
    });

    it('should filter scorecards by playerName (GET /api/v1/scorecard?playerName=...)', async () => {
      const response = await request(app)
        .get(`/api/v1/scorecard?playerName=${encodeURIComponent(testScorecard.playerName)}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBeGreaterThan(0);
      
      // All returned scorecards should match the player name
      response.body.forEach((card: any) => {
        expect(card.playerName).toBe(testScorecard.playerName);
      });
    });

    it('should get a specific scorecard by ID (GET /api/v1/scorecard/:id)', async () => {
      const response = await request(app)
        .get(`/api/v1/scorecard/${testScorecardId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body).toHaveProperty('id');
      expect(response.body.id).toBe(testScorecardId);
      expect(response.body.playerName).toBe(testScorecard.playerName);
      expect(response.body).toHaveProperty('scores');
      expect(response.body.scores.length).toBe(2);
    });

    it('should update a scorecard (PUT /api/v1/scorecards/:id)', async () => {
      const updatedData = {
        playerName: 'Updated Integration Test Player',
        totalScore: 70,
        notes: 'Updated integration test notes'
      };
      
      const response = await request(app)
        .put(`/api/v1/scorecards/${testScorecardId}`)
        .send(updatedData)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(response.body.id).toBe(testScorecardId);
      expect(response.body.playerName).toBe(updatedData.playerName);
      expect(response.body.totalScore).toBe(updatedData.totalScore);
      expect(response.body.notes).toBe(updatedData.notes);
    });

    it('should return 404 when getting a non-existent scorecard', async () => {
      const nonExistentId = uuidv4();
      
      await request(app)
        .get(`/api/v1/scorecard/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('should delete a scorecard (DELETE /api/v1/scorecards/:id)', async () => {
      await request(app)
        .delete(`/api/v1/scorecards/${testScorecardId}`)
        .expect(204);
      
      // Verify it was deleted by trying to fetch it
      await request(app)
        .get(`/api/v1/scorecard/${testScorecardId}`)
        .expect(404);
      
      // Clear the ID since we've deleted it
      testScorecardId = '';
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for invalid scorecard creation', async () => {
      const invalidScorecard = {
        // Missing required fields
        notes: 'Invalid test scorecard'
      };
      
      const response = await request(app)
        .post('/api/v1/scorecard')
        .send(invalidScorecard)
        .expect('Content-Type', /json/)
        .expect(400);
      
      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe(true);
      expect(response.body).toHaveProperty('message');
    });

    it('should return 404 when updating a non-existent scorecard', async () => {
      const nonExistentId = uuidv4();
      
      await request(app)
        .put(`/api/v1/scorecards/${nonExistentId}`)
        .send({ playerName: 'Will not update' })
        .expect('Content-Type', /json/)
        .expect(404);
    });

    it('should return 404 when deleting a non-existent scorecard', async () => {
      const nonExistentId = uuidv4();
      
      await request(app)
        .delete(`/api/v1/scorecards/${nonExistentId}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });
}); 