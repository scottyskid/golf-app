import request from 'supertest';
import { app } from '../../../src/app';
import { assert } from 'chai';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockScorecard = {
  id: uuidv4(),
  playerName: 'Test Player',
  courseId: uuidv4(),
  date: new Date().toISOString(),
  totalScore: 85,
  notes: 'Test round',
  scores: [
    {
      holeNumber: 1,
      score: 5,
      putts: 2,
      fairwayHit: true
    }
  ]
};

const updatedScorecard = {
  ...mockScorecard,
  playerName: 'Updated Player',
  totalScore: 80
};

// Mock the prisma client
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    scorecard: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    holeScore: {
      createMany: jest.fn(),
    },
    $connect: jest.fn(),
    $disconnect: jest.fn(),
  };
  return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient();

describe('Scorecard API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/v1/scorecard', () => {
    it('should return all scorecards', async () => {
      (prisma.scorecard.findMany as jest.Mock).mockResolvedValue([mockScorecard]);
      
      const response = await request(app)
        .get('/api/v1/scorecard')
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.isArray(response.body);
      assert.equal(response.body.length, 1);
      assert.equal(response.body[0].playerName, mockScorecard.playerName);
    });

    it('should filter scorecards by playerName', async () => {
      (prisma.scorecard.findMany as jest.Mock).mockResolvedValue([mockScorecard]);
      
      const response = await request(app)
        .get('/api/v1/scorecard?playerName=Test Player')
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(prisma.scorecard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            playerName: 'Test Player'
          })
        })
      );
    });

    it('should filter scorecards by courseId', async () => {
      (prisma.scorecard.findMany as jest.Mock).mockResolvedValue([mockScorecard]);
      
      const response = await request(app)
        .get(`/api/v1/scorecard?courseId=${mockScorecard.courseId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      expect(prisma.scorecard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            courseId: mockScorecard.courseId
          })
        })
      );
    });
  });

  describe('GET /api/v1/scorecard/:id', () => {
    it('should return a specific scorecard by ID', async () => {
      (prisma.scorecard.findUnique as jest.Mock).mockResolvedValue(mockScorecard);
      
      const response = await request(app)
        .get(`/api/v1/scorecard/${mockScorecard.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.deepEqual(response.body, mockScorecard);
      expect(prisma.scorecard.findUnique).toHaveBeenCalledWith({
        where: { id: mockScorecard.id },
        include: { scores: true }
      });
    });

    it('should return 404 if scorecard not found', async () => {
      (prisma.scorecard.findUnique as jest.Mock).mockResolvedValue(null);
      
      await request(app)
        .get(`/api/v1/scorecard/${uuidv4()}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('POST /api/v1/scorecard', () => {
    it('should create a new scorecard', async () => {
      (prisma.scorecard.create as jest.Mock).mockResolvedValue(mockScorecard);
      (prisma.holeScore.createMany as jest.Mock).mockResolvedValue({ count: 1 });
      
      const response = await request(app)
        .post('/api/v1/scorecard')
        .send(mockScorecard)
        .expect('Content-Type', /json/)
        .expect(201);
      
      assert.deepEqual(response.body, mockScorecard);
      expect(prisma.scorecard.create).toHaveBeenCalled();
      expect(prisma.holeScore.createMany).toHaveBeenCalled();
    });

    it('should return 400 if required fields are missing', async () => {
      const invalidScorecard = {
        // Missing playerName and courseId
        date: new Date().toISOString(),
        totalScore: 85
      };
      
      await request(app)
        .post('/api/v1/scorecard')
        .send(invalidScorecard)
        .expect('Content-Type', /json/)
        .expect(400);
    });
  });

  describe('PUT /api/v1/scorecards/:id', () => {
    it('should update an existing scorecard', async () => {
      (prisma.scorecard.findUnique as jest.Mock).mockResolvedValue(mockScorecard);
      (prisma.scorecard.update as jest.Mock).mockResolvedValue(updatedScorecard);
      
      const response = await request(app)
        .put(`/api/v1/scorecards/${mockScorecard.id}`)
        .send(updatedScorecard)
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.deepEqual(response.body, updatedScorecard);
      expect(prisma.scorecard.update).toHaveBeenCalledWith({
        where: { id: mockScorecard.id },
        data: expect.objectContaining({
          playerName: updatedScorecard.playerName,
          totalScore: updatedScorecard.totalScore
        }),
        include: { scores: true }
      });
    });

    it('should return 404 if scorecard to update not found', async () => {
      (prisma.scorecard.findUnique as jest.Mock).mockResolvedValue(null);
      
      await request(app)
        .put(`/api/v1/scorecards/${uuidv4()}`)
        .send(updatedScorecard)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/scorecards/:id', () => {
    it('should delete a scorecard', async () => {
      (prisma.scorecard.findUnique as jest.Mock).mockResolvedValue(mockScorecard);
      (prisma.scorecard.delete as jest.Mock).mockResolvedValue(mockScorecard);
      
      await request(app)
        .delete(`/api/v1/scorecards/${mockScorecard.id}`)
        .expect(204);
      
      expect(prisma.scorecard.delete).toHaveBeenCalledWith({
        where: { id: mockScorecard.id }
      });
    });

    it('should return 404 if scorecard to delete not found', async () => {
      (prisma.scorecard.findUnique as jest.Mock).mockResolvedValue(null);
      
      await request(app)
        .delete(`/api/v1/scorecards/${uuidv4()}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });
}); 