import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class HoleScoreModel {
    @ApiProperty({ description: "Unique ID of the hole score", example: "5f8b6c7d-3e5a-4b1c-9d7e-1f2a3b4c5d6e" })
    id!: string;

    @ApiProperty({
        description: "ID of the scorecard this hole belongs to",
        example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d",
    })
    scorecardId!: string;

    @ApiProperty({ description: "Hole number", minimum: 1, example: 1 })
    holeNumber!: number;

    @ApiProperty({ description: "Score for the hole", minimum: 1, example: 4 })
    score!: number;

    @ApiPropertyOptional({ description: "Number of putts on the hole", minimum: 0, example: 2 })
    putts?: number;

    @ApiPropertyOptional({ description: "Whether the fairway was hit", example: true })
    fairwayHit?: boolean;
}

export class ScorecardModel {
    @ApiProperty({ description: "Unique ID of the scorecard", example: "1a2b3c4d-5e6f-7a8b-9c0d-1e2f3a4b5c6d" })
    id!: string;

    @ApiProperty({ description: "Name of the player", example: "John Doe" })
    playerName!: string;

    @ApiProperty({ description: "ID of the golf course", example: "123e4567-e89b-12d3-a456-426614174000" })
    courseId!: string;

    @ApiProperty({ description: "Date the round was played", type: Date, example: "2023-08-15T14:30:00Z" })
    date!: Date;

    @ApiProperty({ description: "Total score for the round", example: 72 })
    totalScore!: number;

    @ApiPropertyOptional({ description: "Additional notes about the round", example: "Played in windy conditions" })
    notes?: string;

    @ApiProperty({
        description: "Individual hole scores",
        type: [HoleScoreModel],
        isArray: true,
    })
    scores!: HoleScoreModel[];
}

export class ScorecardListResponse {
    @ApiProperty({
        description: "Array of scorecards",
        type: [ScorecardModel],
        isArray: true,
    })
    data!: ScorecardModel[];
}

export class ErrorResponse {
    @ApiProperty({ description: "HTTP status code", example: 404 })
    statusCode!: number;

    @ApiProperty({ description: "Error message", example: "Scorecard not found" })
    message!: string;

    @ApiProperty({ description: "Error identifier", example: "SCORECARD_NOT_FOUND" })
    error!: string;
}
