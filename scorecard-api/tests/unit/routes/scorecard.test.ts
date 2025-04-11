import { jest, describe, it, expect, beforeEach } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import request from "supertest";
import { v4 as uuidv4 } from "uuid";

import { app } from "../../../src/app";
import { Scorecard } from "../../../src/types/scorecard";

// Mock data with all required fields
const mockScorecard = {
    id: uuidv4(),
    playerName: "Test Player",
    courseId: uuidv4(),
    date: new Date(),
    totalScore: 85,
    notes: "Test round",
    createdAt: new Date(),
    updatedAt: new Date(),
    scores: [
        {
            holeNumber: 1,
            score: 5,
            putts: 2,
            fairwayHit: true,
        },
    ],
};

const updatedScorecard = {
    ...mockScorecard,
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

// Mock the prisma client
jest.mock("@prisma/client", () => {
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
            deleteMany: jest.fn(),
        },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    };
    return { PrismaClient: jest.fn(() => mockPrismaClient) };
});

const prisma = new PrismaClient();

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
    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("GET /api/v1/scorecard", () => {
        it("should return all scorecards", async () => {
            jest.spyOn(prisma.scorecard, "findMany").mockResolvedValue([mockScorecard]);

            const response = await request(app).get("/api/v1/scorecard").expect(200).expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBe(1);
            expect(response.body[0].playerName).toBe(mockScorecard.playerName);
        });

        it("should filter scorecards by playerName", async () => {
            jest.spyOn(prisma.scorecard, "findMany").mockResolvedValue([mockScorecard]);

            const response = await request(app)
                .get("/api/v1/scorecard?playerName=Test Player")
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(prisma.scorecard.findMany).toHaveBeenCalledWith(
                expect.objectContaining({
                    where: expect.objectContaining({
                        playerName: "Test Player",
                    }),
                }),
            );
        });

        it("should filter scorecards by courseId", async () => {
            jest.spyOn(prisma.scorecard, "findMany").mockResolvedValue([mockScorecard]);

            const response = await request(app)
                .get(`/api/v1/scorecard?courseId=${mockScorecard.courseId}`)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(Array.isArray(response.body)).toBe(true);
            expect(prisma.scorecard.findMany).toHaveBeenCalledWith(
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
            jest.spyOn(prisma.scorecard, "findUnique").mockResolvedValue(mockScorecard);

            const response = await request(app)
                .get(`/api/v1/scorecard/${mockScorecard.id}`)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(response.body).toEqual(toJsonSerializable(mockScorecard));
            expect(prisma.scorecard.findUnique).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
                include: { scores: true },
            });
        });

        it("should return 404 if scorecard not found", async () => {
            jest.spyOn(prisma.scorecard, "findUnique").mockResolvedValue(null);

            await request(app).get(`/api/v1/scorecard/${uuidv4()}`).expect(404).expect("Content-Type", /json/);
        });
    });

    describe("POST /api/v1/scorecard", () => {
        it("should create a new scorecard", async () => {
            jest.spyOn(prisma.scorecard, "create").mockResolvedValue(mockScorecard);
            jest.spyOn(prisma.holeScore, "createMany").mockResolvedValue({ count: 1 });

            const response = await request(app)
                .post("/api/v1/scorecard")
                .send(mockScorecard)
                .expect(201)
                .expect("Content-Type", /json/);

            // Verify that the create method was called with the correct data
            expect(prisma.scorecard.create).toHaveBeenCalledWith(
                expect.objectContaining({
                    data: expect.objectContaining({
                        playerName: mockScorecard.playerName,
                        courseId: mockScorecard.courseId,
                        totalScore: mockScorecard.totalScore,
                    }),
                }),
            );

            // Verify hole scores were created
            expect(prisma.holeScore.createMany).toHaveBeenCalled();

            // Verify that the response contains a success indicator
            expect(response.body).toBeDefined();
        });

        it("should return 400 if required fields are missing", async () => {
            const invalidScorecard = {
                // Missing playerName and courseId
                date: new Date().toISOString(),
                totalScore: 85,
            };

            await request(app)
                .post("/api/v1/scorecard")
                .send(invalidScorecard)
                .expect(400)
                .expect("Content-Type", /json/);
        });
    });

    describe("PUT /api/v1/scorecard/:id", () => {
        it("should update an existing scorecard", async () => {
            jest.spyOn(prisma.scorecard, "findUnique")
                .mockResolvedValueOnce(mockScorecard) // First call to check if exists
                .mockResolvedValueOnce(updatedScorecard); // Second call to get updated result

            jest.spyOn(prisma.scorecard, "update").mockResolvedValue(updatedScorecard);
            jest.spyOn(prisma.holeScore, "deleteMany").mockResolvedValue({ count: 1 });
            jest.spyOn(prisma.holeScore, "createMany").mockResolvedValue({ count: 2 });

            const response = await request(app)
                .put(`/api/v1/scorecard/${mockScorecard.id}`)
                .send(updatedScorecard)
                .expect(200)
                .expect("Content-Type", /json/);

            expect(response.body).toEqual(toJsonSerializable(updatedScorecard));
            expect(prisma.scorecard.update).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
                data: expect.objectContaining({
                    playerName: updatedScorecard.playerName,
                    totalScore: updatedScorecard.totalScore,
                }),
                include: { scores: true },
            });

            // Verify that deleteMany and createMany were called for scores
            expect(prisma.holeScore.deleteMany).toHaveBeenCalledWith({
                where: { scorecardId: mockScorecard.id },
            });

            expect(prisma.holeScore.createMany).toHaveBeenCalled();
        });

        it("should return 404 if scorecard to update not found", async () => {
            jest.spyOn(prisma.scorecard, "findUnique").mockResolvedValue(null);

            await request(app)
                .put(`/api/v1/scorecard/${uuidv4()}`)
                .send(updatedScorecard)
                .expect(404)
                .expect("Content-Type", /json/);
        });
    });

    describe("DELETE /api/v1/scorecard/:id", () => {
        it("should delete a scorecard", async () => {
            jest.spyOn(prisma.scorecard, "findUnique").mockResolvedValue(mockScorecard);
            jest.spyOn(prisma.scorecard, "delete").mockResolvedValue(mockScorecard);

            await request(app).delete(`/api/v1/scorecard/${mockScorecard.id}`).expect(204);

            expect(prisma.scorecard.delete).toHaveBeenCalledWith({
                where: { id: mockScorecard.id },
            });
        });

        it("should return 404 if scorecard to delete not found", async () => {
            jest.spyOn(prisma.scorecard, "findUnique").mockResolvedValue(null);

            await request(app).delete(`/api/v1/scorecard/${uuidv4()}`).expect(404).expect("Content-Type", /json/);
        });
    });
});
