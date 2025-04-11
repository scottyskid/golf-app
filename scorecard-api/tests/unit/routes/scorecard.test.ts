import request from 'supertest';
import { app } from '../../../src/app';
import { assert } from 'chai';
import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { Scorecard } from '../../../src/types/scorecard';

// Mock data with all required fields
const mockScorecard = {
  id: uuidv4(),
  playerName: 'Test Player',
  courseId: uuidv4(),
  date: new Date(),
  totalScore: 85,
  notes: 'Test round',
  createdAt: new Date(),
  updatedAt: new Date(),
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

function toJsonSerializable(scorecard: Scorecard) {
  return {
    ...scorecard,
    date: scorecard.date instanceof Date ? scorecard.date.toISOString() : scorecard.date,
    createdAt: scorecard.createdAt instanceof Date ? scorecard.createdAt.toISOString() : scorecard.createdAt,
    updatedAt: scorecard.updatedAt instanceof Date ? scorecard.updatedAt.toISOString() : scorecard.updatedAt
  };
}

describe('Scorecard API', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  describe('GET /api/v1/scorecard', () => {
    it('should return all scorecards', async () => {
      jest.spyOn(prisma.scorecard, 'findMany').mockResolvedValue([mockScorecard]);
      
      const response = await request(app)
        .get('/api/v1/scorecard')
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.isArray(response.body);
      assert.equal(response.body.length, 1);
      assert.equal(response.body[0].playerName, mockScorecard.playerName);
    });

    it('should filter scorecards by playerName', async () => {
      jest.spyOn(prisma.scorecard, 'findMany').mockResolvedValue([mockScorecard]);
      
      const response = await request(app)
        .get('/api/v1/scorecard?playerName=Test Player')
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.isArray(response.body);
      expect(prisma.scorecard.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            playerName: 'Test Player'
          })
        })
      );
    });

    it('should filter scorecards by courseId', async () => {
      jest.spyOn(prisma.scorecard, 'findMany').mockResolvedValue([mockScorecard]);
      
      const response = await request(app)
        .get(`/api/v1/scorecard?courseId=${mockScorecard.courseId}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.isArray(response.body);
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
      jest.spyOn(prisma.scorecard, 'findUnique').mockResolvedValue(mockScorecard);
      
      const response = await request(app)
        .get(`/api/v1/scorecard/${mockScorecard.id}`)
        .expect('Content-Type', /json/)
        .expect(200);
      
      assert.deepEqual(response.body, toJsonSerializable(mockScorecard));
      expect(prisma.scorecard.findUnique).toHaveBeenCalledWith({
        where: { id: mockScorecard.id },
        include: { scores: true }
      });
    });

    it('should return 404 if scorecard not found', async () => {
      jest.spyOn(prisma.scorecard, 'findUnique').mockResolvedValue(null);
      
      await request(app)
        .get(`/api/v1/scorecard/${uuidv4()}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('POST /api/v1/scorecard', () => {
    it('should create a new scorecard', async () => {
      jest.spyOn(prisma.scorecard, 'create').mockResolvedValue(mockScorecard);
      jest.spyOn(prisma.holeScore, 'createMany').mockResolvedValue({ count: 1 });
      
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
      jest.spyOn(prisma.scorecard, 'findUnique').mockResolvedValue(mockScorecard);
      jest.spyOn(prisma.scorecard, 'update').mockResolvedValue(updatedScorecard);
      
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
      jest.spyOn(prisma.scorecard, 'findUnique').mockResolvedValue(null);
      
      await request(app)
        .put(`/api/v1/scorecards/${uuidv4()}`)
        .send(updatedScorecard)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });

  describe('DELETE /api/v1/scorecards/:id', () => {
    it('should delete a scorecard', async () => {
      jest.spyOn(prisma.scorecard, 'findUnique').mockResolvedValue(mockScorecard);
      jest.spyOn(prisma.scorecard, 'delete').mockResolvedValue(mockScorecard);
      
      await request(app)
        .delete(`/api/v1/scorecards/${mockScorecard.id}`)
        .expect(204);
      
      expect(prisma.scorecard.delete).toHaveBeenCalledWith({
        where: { id: mockScorecard.id }
      });
    });

    it('should return 404 if scorecard to delete not found', async () => {
      jest.spyOn(prisma.scorecard, 'findUnique').mockResolvedValue(null);
      
      await request(app)
        .delete(`/api/v1/scorecard/${uuidv4()}`)
        .expect('Content-Type', /json/)
        .expect(404);
    });
  });
}); 