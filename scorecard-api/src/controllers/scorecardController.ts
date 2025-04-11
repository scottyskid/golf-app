import { Request, Response, NextFunction } from "express";

import { ApiError } from "../middlewares/errorHandler";
import { scorecardService } from "../services/scorecardService";
import { Scorecard } from "../types/scorecard";

export const scorecardController = {
    /**
     * Get all scorecards with optional filtering
     */
    getAllScorecards: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { playerName, courseId } = req.query;

            const filter = {
                playerName: playerName as string,
                courseId: courseId as string,
            };

            const scorecards = await scorecardService.getAllScorecards(filter);
            res.json(scorecards);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Get a single scorecard by ID
     */
    getScorecardById: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const scorecard = await scorecardService.getScorecardById(id);
            res.json(scorecard);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Create a new scorecard
     */
    createScorecard: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const data = req.body as Scorecard;

            // Validate required fields
            if (!data.playerName || !data.courseId) {
                throw new ApiError("Player name and course ID are required", 400);
            }

            const scorecard = await scorecardService.createScorecard(data);
            res.status(201).json(scorecard);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Update an existing scorecard
     */
    updateScorecard: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const data = req.body as Scorecard;

            const updatedScorecard = await scorecardService.updateScorecard(id, data);
            res.json(updatedScorecard);
        } catch (error) {
            next(error);
        }
    },

    /**
     * Delete a scorecard
     */
    deleteScorecard: async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await scorecardService.deleteScorecard(id);
            res.status(204).end();
        } catch (error) {
            next(error);
        }
    },
};
