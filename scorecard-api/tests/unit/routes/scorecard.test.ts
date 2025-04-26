import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

// Disable the no-explicit-any rule for this test file
/* eslint-disable @typescript-eslint/no-explicit-any */

import { PrismaModule } from "../../../src/prisma/prisma.module";
import { PrismaService } from "../../../src/prisma/prisma.service";
import { ScorecardModule } from "../../../src/scorecard/scorecard.module";
import { Scorecard } from "../../../src/types/scorecard";

// Mock data for sending in requests (matches the DTO)
const scorecardPayload = {
    playerName: "Test Player",
    courseId: uuidv4(),
    date: new Date().toISOString(), // Convert to ISO string for proper serialization
    totalScore: 85,
    notes: "Test round",
    scores: [
        {
            holeNumber: 1,
            score: 5,
            putts: 2,
            fairwayHit: true,
        },
    ],
};

// Complete mock data for validation (includes server-side fields)
const mockScorecard = {
    id: uuidv4(),
    ...scorecardPayload,
    date: new Date(scorecardPayload.date),
    createdAt: new Date(),
    updatedAt: new Date(),
};

// For updates, separate payload from expected result
const updatePayload = {
    playerName: "Updated Player",
    totalScore: 80,
    scores: [
        {
            holeNumber: 1,
            score: 4,
            putts: 1,
            fairwayHit: true,
        },
        {
            holeNumber: 2,
            score: 3,
            putts: 1,
            fairwayHit: false,
        },
    ],
};

const updatedScorecard = {
    ...mockScorecard,
    ...updatePayload,
};

// FIXME: This feels really flakey, how do we fix this
interface SerializableScorecardWithStringDates extends Omit<Scorecard, "date" | "createdAt" | "updatedAt"> {
    date?: string;
    createdAt?: string;
    updatedAt?: string;
}

function toJsonSerializable(scorecard: Scorecard): SerializableScorecardWithStringDates {
    return {
        ...scorecard,
        date: scorecard.date instanceof Date ? scorecard.date.toISOString() : (scorecard.date as string | undefined),
        createdAt:
            scorecard.createdAt instanceof Date
                ? scorecard.createdAt.toISOString()
                : (scorecard.createdAt as string | undefined),
        updatedAt:
            scorecard.updatedAt instanceof Date
                ? scorecard.updatedAt.toISOString()
                : (scorecard.updatedAt as string | undefined),
    };
}

describe("Scorecard API", () => {
    let app: INestApplication;

    beforeEach(async () => {
        jest.resetAllMocks();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ScorecardModule, PrismaModule],
        })
            .overrideProvider(PrismaService)
            .useValue(mockPrismaService)
            .compile();

        app = moduleFixture.createNestApplication();
        app.setGlobalPrefix("api/v1");
        await app.init();
    });

    afterEach(async () => {
        if (app) {
            await app.close();
        }
    });

    describe("GET /api/v1/scorecard", () => {
        it("should return all scorecards", async () => {
            mockPrismaService.scorecard.findMany.mockResolvedValue([mockScorecard]);

            const response = await request(app.getHttpServer())
                .get("/api/v1/scorecard")
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].playerName).toBe(mockScorecard.playerName);
        });

        it("should filter scorecards by playerName", async () => {
            mockPrismaService.scorecard.findMany.mockResolvedValue([mockScorecard]);

            const response = await request(app.getHttpServer())
                .get("/api/v1/scorecard?playerName=Test Player")
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(mockPrismaService.scorecard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        playerName: "Test Player",
                    }),
                }),
            );
        });

        it("should filter scorecards by courseId", async () => {
            mockPrismaService.scorecard.findMany.mockResolvedValue([mockScorecard]);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/scorecard?courseId=${mockScorecard.courseId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(mockPrismaService.scorecard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        courseId: mockScorecard.courseId,
                    }),
                }),
            );
        });
    });

    describe("GET /api/v1/scorecard/:id", () => {
        it("should return a specific scorecard by ID", async () => {
            mockPrismaService.scorecard.findUnique.mockResolvedValue(mockScorecard);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/scorecard/${mockScorecard.id}`)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(response.body).toEqual(toJsonSerializable(mockScorecard));
            expect(mockPrismaService.scorecard.findUnique).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
                include: { scores: true },
            });
        });

        it("should return 404 if scorecard not found", async () => {
            mockPrismaService.scorecard.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .get(`/api/v1/scorecard/${uuidv4()}`)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });

    describe("POST /api/v1/scorecard", () => {
        it("should create a new scorecard", async () => {
            mockPrismaService.scorecard.create.mockResolvedValue(mockScorecard);
            mockPrismaService.holeScore.createMany.mockResolvedValue({ count: 1 });
            mockPrismaService.scorecard.findUnique.mockResolvedValue(mockScorecard);

            const response = await request(app.getHttpServer())
                .post("/api/v1/scorecard")
                .send(scorecardPayload) // Send only the payload without ID/timestamps
                .expect(201)
                .expect("Content-Type", /json/);

            // Verify that the create method was called with the correct data
            expect(mockPrismaService.scorecard.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        playerName: scorecardPayload.playerName,
                        courseId: scorecardPayload.courseId,
                        totalScore: scorecardPayload.totalScore,
                    }),
                }),
            );

            // Verify hole scores were created
            expect(mockPrismaService.holeScore.createMany).toHaveBeenCalled();

            // Verify that the response contains a success indicator
            expect(response.body).toBeDefined();
        });

        it("should return 400 if required fields are missing", async () => {
            const invalidScorecard = {
                // Missing playerName and courseId
                date: new Date().toISOString(),
                totalScore: 85,
            };

            await request(app.getHttpServer())
                .post("/api/v1/scorecard")
                .send(invalidScorecard)
                .expect(400)
                .expect("Content-Type", /json/);
        });
    });

    describe("PUT /api/v1/scorecard/:id", () => {
        it("should update an existing scorecard", async () => {
            mockPrismaService.scorecard.findUnique
                .mockResolvedValueOnce(mockScorecard) // First call to check if exists
                .mockResolvedValueOnce(updatedScorecard); // Second call to get updated result

            mockPrismaService.scorecard.update.mockResolvedValue(updatedScorecard);
            mockPrismaService.holeScore.deleteMany.mockResolvedValue({ count: 1 });
            mockPrismaService.holeScore.createMany.mockResolvedValue({ count: 2 });

            const response = await request(app.getHttpServer())
                .put(`/api/v1/scorecard/${mockScorecard.id}`)
                .send(updatePayload)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(response.body).toEqual(toJsonSerializable(updatedScorecard));
            expect(mockPrismaService.scorecard.update).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
                data: expect.objectContaining({
                    playerName: updatePayload.playerName,
                    totalScore: updatePayload.totalScore,
                }),
                include: { scores: true },
            });

            // Verify that deleteMany and createMany were called for scores
            expect(mockPrismaService.holeScore.deleteMany).toHaveBeenCalledWith({
                where: { scorecardId: mockScorecard.id },
            });

            expect(mockPrismaService.holeScore.createMany).toHaveBeenCalled();
        });

        it("should return 404 if scorecard to update not found", async () => {
            mockPrismaService.scorecard.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .put(`/api/v1/scorecard/${uuidv4()}`)
                .send(updatePayload)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });

    describe("DELETE /api/v1/scorecard/:id", () => {
        it("should delete a scorecard", async () => {
            mockPrismaService.scorecard.findUnique.mockResolvedValue(mockScorecard);
            mockPrismaService.scorecard.delete.mockResolvedValue(mockScorecard);

            await request(app.getHttpServer()).delete(`/api/v1/scorecard/${mockScorecard.id}`).expect(204);

            expect(mockPrismaService.scorecard.delete).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
            });
        });

        it("should return 404 if scorecard to delete not found", async () => {
            mockPrismaService.scorecard.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .delete(`/api/v1/scorecard/${uuidv4()}`)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });
});

// Create a mock PrismaService with type assertion for jest functions
const mockPrismaService = {
    scorecard: {
        findMany: jest.fn() as any,
        findUnique: jest.fn() as any,
        create: jest.fn() as any,
        update: jest.fn() as any,
        delete: jest.fn() as any,
    },
    holeScore: {
        createMany: jest.fn() as any,
        deleteMany: jest.fn() as any,
    },
    $connect: jest.fn() as any,
    $disconnect: jest.fn() as any,
} as any;
