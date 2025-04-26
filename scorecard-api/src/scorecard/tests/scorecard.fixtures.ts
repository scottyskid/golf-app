import { Scorecard, HoleScore } from "@prisma/client";
import { v4 as uuidv4 } from "uuid";

// Type for creating a scorecard with hole scores
export interface ScorecardWithScores extends Scorecard {
    scores: HoleScore[];
}

// Base scorecard for testing
export const createScorecard = (override: Partial<Scorecard> = {}): Scorecard => {
    const defaultScorecard: Scorecard = {
        id: uuidv4(),
        playerName: "Test Player",
        courseId: uuidv4(),
        date: new Date(),
        totalScore: 85,
        notes: "Test round",
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return {
        ...defaultScorecard,
        ...override,
    };
};

// Create a hole score for testing
export const createHoleScore = (
    scorecardId: string,
    holeNumber: number,
    override: Partial<HoleScore> = {},
): HoleScore => {
    const defaultHoleScore: HoleScore = {
        id: uuidv4(),
        scorecardId,
        holeNumber,
        score: 4,
        putts: 2,
        fairwayHit: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    };

    return {
        ...defaultHoleScore,
        ...override,
    };
};

// Create a complete scorecard with hole scores
export const createScorecardWithScores = (
    override: Partial<ScorecardWithScores> = {},
    holeCount = 1,
): ScorecardWithScores => {
    const scorecard = createScorecard(override);

    const scores = Array.from({ length: holeCount }, (_, i) =>
        createHoleScore(scorecard.id, i + 1, override.scores?.[i]),
    );

    return {
        ...scorecard,
        scores,
        ...(override.scores ? { scores: [...scores, ...override.scores.slice(holeCount)] } : {}),
    };
};
