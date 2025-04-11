import { Prisma } from "@prisma/client";

import prisma from "../db";
import { ApiError } from "../middlewares/errorHandler";
import { Scorecard, ScorecardFilter } from "../types/scorecard";

export const scorecardService = {
    /**
     * Get all scorecards with optional filtering
     */
    getAllScorecards: async (filter: ScorecardFilter = {}) => {
        const where: Prisma.ScorecardWhereInput = {};

        if (filter.playerName) {
            where.playerName = filter.playerName;
        }

        if (filter.courseId) {
            where.courseId = filter.courseId;
        }

        return prisma.scorecard.findMany({
            where,
            include: { scores: true },
        });
    },

    /**
     * Get a single scorecard by ID
     */
    getScorecardById: async (id: string) => {
        const scorecard = await prisma.scorecard.findUnique({
            where: { id },
            include: { scores: true },
        });

        if (!scorecard) {
            throw new ApiError("Scorecard not found", 404);
        }

        return scorecard;
    },

    /**
     * Create a new scorecard with hole scores
     */
    createScorecard: async (data: Scorecard) => {
        const { scores, ...scorecardData } = data;

        // Create the scorecard
        const scorecard = await prisma.scorecard.create({
            data: {
                ...scorecardData,
                date: data.date ? new Date(data.date) : new Date(),
            },
        });

        // Create hole scores if provided
        if (scores && scores.length > 0) {
            await prisma.holeScore.createMany({
                data: scores.map((score) => ({
                    ...score,
                    scorecardId: scorecard.id,
                })),
            });
        }

        // Return the created scorecard with scores
        return prisma.scorecard.findUnique({
            where: { id: scorecard.id },
            include: { scores: true },
        });
    },

    /**
     * Update an existing scorecard
     */
    updateScorecard: async (id: string, data: Scorecard) => {
        // Check if scorecard exists
        const exists = await prisma.scorecard.findUnique({
            where: { id },
        });

        if (!exists) {
            throw new ApiError("Scorecard not found", 404);
        }

        const { scores, ...scorecardData } = data;

        // Update the scorecard
        const updated = await prisma.scorecard.update({
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
            await prisma.holeScore.deleteMany({
                where: { scorecardId: id },
            });

            // Create new scores
            await prisma.holeScore.createMany({
                data: scores.map((score) => ({
                    ...score,
                    scorecardId: id,
                })),
            });

            // Fetch updated scorecard with new scores
            return prisma.scorecard.findUnique({
                where: { id },
                include: { scores: true },
            });
        }

        return updated;
    },

    /**
     * Delete a scorecard by ID
     */
    deleteScorecard: async (id: string) => {
        // Check if scorecard exists
        const exists = await prisma.scorecard.findUnique({
            where: { id },
        });

        if (!exists) {
            throw new ApiError("Scorecard not found", 404);
        }

        // Delete the scorecard (cascade will delete scores)
        return prisma.scorecard.delete({
            where: { id },
        });
    },
};
