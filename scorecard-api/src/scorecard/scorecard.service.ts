import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { Scorecard, HoleScore } from "@prisma/client";

import { PrismaService } from "../prisma/prisma.service";

import { CreateScorecardDto, UpdateScorecardDto, ScorecardFilterDto } from "./dto/scorecard.dto";

// Define interface for Prisma errors
interface PrismaError extends Error {
    code?: string;
}

@Injectable()
export class ScorecardService {
    constructor(private prisma: PrismaService) {}

    /**
     * Get all scorecards with optional filtering
     */
    async getAllScorecards(filter: ScorecardFilterDto = {}): Promise<(Scorecard & { scores: HoleScore[] })[]> {
        const where: Record<string, unknown> = {};

        if (filter.playerName) {
            where.playerName = filter.playerName;
        }

        if (filter.courseId) {
            where.courseId = filter.courseId;
        }

        return this.prisma.scorecard.findMany({
            where,
            include: { scores: true },
        });
    }

    /**
     * Get a single scorecard by ID
     */
    async getScorecardById(id: string): Promise<Scorecard & { scores: HoleScore[] }> {
        const scorecard = await this.prisma.scorecard.findUnique({
            where: { id },
            include: { scores: true },
        });

        if (!scorecard) {
            throw new NotFoundException("Scorecard not found");
        }

        return scorecard;
    }

    /**
     * Create a new scorecard with hole scores
     */
    async createScorecard(data: CreateScorecardDto): Promise<Scorecard & { scores: HoleScore[] }> {
        try {
            // Validate required fields
            if (!data.playerName || !data.courseId) {
                throw new BadRequestException("PlayerName and courseId are required fields");
            }

            const { scores, ...scorecardData } = data;

            // Create the scorecard
            const scorecard = await this.prisma.scorecard.create({
                data: {
                    ...scorecardData,
                    date: data.date ? new Date(data.date) : new Date(),
                },
            });

            // Create hole scores if provided
            if (scores && scores.length > 0) {
                await this.prisma.holeScore.createMany({
                    data: scores.map((score) => ({
                        ...score,
                        scorecardId: scorecard.id,
                    })),
                });
            }

            // Return the created scorecard with scores
            return this.prisma.scorecard.findUnique({
                where: { id: scorecard.id },
                include: { scores: true },
            }) as Promise<Scorecard & { scores: HoleScore[] }>;
        } catch (error: Error | unknown) {
            // Handle database or validation errors
            if (error instanceof Error) {
                // Check for Prisma-specific error
                const prismaError = error as PrismaError;
                if (prismaError.code === "P2002") {
                    throw new BadRequestException("A scorecard with this ID already exists");
                }

                // Re-throw NestJS errors
                if (error instanceof BadRequestException) {
                    throw error;
                }

                // For any other errors
                throw new BadRequestException(error.message || "Failed to create scorecard");
            }

            throw new BadRequestException("Failed to create scorecard");
        }
    }

    /**
     * Update an existing scorecard
     */
    async updateScorecard(id: string, data: UpdateScorecardDto): Promise<Scorecard & { scores: HoleScore[] }> {
        // Check if scorecard exists
        const exists = await this.prisma.scorecard.findUnique({
            where: { id },
        });

        if (!exists) {
            throw new NotFoundException("Scorecard not found");
        }

        const { scores, ...scorecardData } = data;

        // Update the scorecard
        const updated = await this.prisma.scorecard.update({
            where: { id },
            data: {
                ...scorecardData,
                date: data.date ? new Date(data.date) : undefined,
            },
            include: { scores: true },
        });

        // Handle score updates if provided
        if (scores && scores.length > 0) {
            // First delete existing scores
            await this.prisma.holeScore.deleteMany({
                where: { scorecardId: id },
            });

            // Create new scores
            await this.prisma.holeScore.createMany({
                data: scores.map((score) => ({
                    ...score,
                    scorecardId: id,
                })),
            });

            // Fetch updated scorecard with new scores
            return this.prisma.scorecard.findUnique({
                where: { id },
                include: { scores: true },
            }) as Promise<Scorecard & { scores: HoleScore[] }>;
        }

        return updated;
    }

    /**
     * Delete a scorecard by ID
     */
    async deleteScorecard(id: string): Promise<Scorecard> {
        // Check if scorecard exists
        const exists = await this.prisma.scorecard.findUnique({
            where: { id },
        });

        if (!exists) {
            throw new NotFoundException("Scorecard not found");
        }

        // Delete the scorecard (cascade will delete scores)
        return this.prisma.scorecard.delete({
            where: { id },
        });
    }
}
