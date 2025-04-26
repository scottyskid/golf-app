import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

// Disable the no-explicit-any rule for this test file

import { PrismaModule } from "../../prisma/prisma.module";
import { PrismaService } from "../../prisma/prisma.service";
import { prismaMock } from "../../tests/testSetup";
import { ScorecardModule } from "../scorecard.module";

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

// Complete mock data for validation with json valid response
const mockScorecardResponse = {
    ...mockScorecard, // Include all properties from mockScorecard to ensure id and others are the same
    date: new Date(scorecardPayload.date).toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

const updatedScorecardResponse = {
    ...mockScorecardResponse,
    ...updatePayload,
};

describe("Scorecard API", () => {
    let app: INestApplication;

    beforeEach(async () => {
        jest.resetAllMocks();

        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [ScorecardModule, PrismaModule],
        })
            .overrideProvider(PrismaService)
            .useValue(prismaMock)
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
            prismaMock.scorecard.findMany.mockResolvedValue([mockScorecard]);

            const response = await request(app.getHttpServer())
                .get("/api/v1/scorecard")
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].playerName).toBe(mockScorecard.playerName);
        });

        it("should filter scorecards by playerName", async () => {
            prismaMock.scorecard.findMany.mockResolvedValue([mockScorecard]);

            const response = await request(app.getHttpServer())
                .get("/api/v1/scorecard?playerName=Test Player")
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(prismaMock.scorecard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        playerName: "Test Player",
                    }),
                }),
            );
        });

        it("should filter scorecards by courseId", async () => {
            prismaMock.scorecard.findMany.mockResolvedValue([mockScorecard]);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/scorecard?courseId=${mockScorecard.courseId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(prismaMock.scorecard.findMany).toHaveBeenCalledWith(
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
            prismaMock.scorecard.findUnique.mockResolvedValue(mockScorecard);

            const response = await request(app.getHttpServer())
                .get(`/api/v1/scorecard/${mockScorecard.id}`)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(response.body).toEqual(mockScorecardResponse);
            expect(prismaMock.scorecard.findUnique).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
                include: { scores: true },
            });
        });

        it("should return 404 if scorecard not found", async () => {
            prismaMock.scorecard.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .get(`/api/v1/scorecard/${uuidv4()}`)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });

    describe("POST /api/v1/scorecard", () => {
        it("should create a new scorecard", async () => {
            prismaMock.scorecard.create.mockResolvedValue(mockScorecard);
            prismaMock.holeScore.createMany.mockResolvedValue({ count: 1 });
            prismaMock.scorecard.findUnique.mockResolvedValue(mockScorecard);

            const response = await request(app.getHttpServer())
                .post("/api/v1/scorecard")
                .send(scorecardPayload) // Send only the payload without ID/timestamps
                .expect(201)
                .expect("Content-Type", /json/);

            // Verify that the create method was called with the correct data
            expect(prismaMock.scorecard.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        playerName: scorecardPayload.playerName,
                        courseId: scorecardPayload.courseId,
                        totalScore: scorecardPayload.totalScore,
                    }),
                }),
            );

            // Verify hole scores were created
            expect(prismaMock.holeScore.createMany).toHaveBeenCalled();

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
            prismaMock.scorecard.findUnique
                .mockResolvedValueOnce(mockScorecard) // First call to check if exists
                .mockResolvedValueOnce(updatedScorecard); // Second call to get updated result

            prismaMock.scorecard.update.mockResolvedValue(updatedScorecard);
            prismaMock.holeScore.deleteMany.mockResolvedValue({ count: 1 });
            prismaMock.holeScore.createMany.mockResolvedValue({ count: 2 });

            const response = await request(app.getHttpServer())
                .put(`/api/v1/scorecard/${mockScorecard.id}`)
                .send(updatePayload)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(response.body).toEqual(updatedScorecardResponse);
            expect(prismaMock.scorecard.update).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
                data: expect.objectContaining({
                    playerName: updatePayload.playerName,
                    totalScore: updatePayload.totalScore,
                }),
                include: { scores: true },
            });

            // Verify that deleteMany and createMany were called for scores
            expect(prismaMock.holeScore.deleteMany).toHaveBeenCalledWith({
                where: { scorecardId: mockScorecard.id },
            });

            expect(prismaMock.holeScore.createMany).toHaveBeenCalled();
        });

        it("should return 404 if scorecard to update not found", async () => {
            prismaMock.scorecard.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .put(`/api/v1/scorecard/${uuidv4()}`)
                .send(updatePayload)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });

    describe("DELETE /api/v1/scorecard/:id", () => {
        it("should delete a scorecard", async () => {
            prismaMock.scorecard.findUnique.mockResolvedValue(mockScorecard);
            prismaMock.scorecard.delete.mockResolvedValue(mockScorecard);

            await request(app.getHttpServer()).delete(`/api/v1/scorecard/${mockScorecard.id}`).expect(204);

            expect(prismaMock.scorecard.delete).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
            });
        });

        it("should return 404 if scorecard to delete not found", async () => {
            prismaMock.scorecard.findUnique.mockResolvedValue(null);

            await request(app.getHttpServer())
                .delete(`/api/v1/scorecard/${uuidv4()}`)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });
});
