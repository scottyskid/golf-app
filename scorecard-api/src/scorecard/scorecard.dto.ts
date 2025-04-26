import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
    IsString,
    IsNumber,
    IsOptional,
    IsBoolean,
    IsDate,
    IsArray,
    ValidateNested,
    Min,
    IsInt,
} from "class-validator";

export class HoleScoreDto {
    @ApiPropertyOptional({ description: "Unique ID of the hole score" })
    @IsOptional()
    id?: string;

    @ApiPropertyOptional({ description: "ID of the scorecard this hole belongs to" })
    @IsOptional()
    scorecardId?: string;

    @ApiProperty({ description: "Hole number", minimum: 1, example: 1 })
    @IsInt()
    @Min(1)
    holeNumber!: number;

    @ApiProperty({ description: "Score for the hole", minimum: 1, example: 4 })
    @IsInt()
    @Min(1)
    score!: number;

    @ApiPropertyOptional({ description: "Number of putts on the hole", minimum: 0, example: 2 })
    @IsOptional()
    @IsInt()
    @Min(0)
    putts?: number;

    @ApiPropertyOptional({ description: "Whether the fairway was hit", example: true })
    @IsOptional()
    @IsBoolean()
    fairwayHit?: boolean;
}

export class CreateScorecardDto {
    @ApiProperty({ description: "Name of the player", example: "John Doe" })
    @IsString()
    playerName!: string;

    @ApiProperty({ description: "ID of the golf course", example: "123e4567-e89b-12d3-a456-426614174000" })
    @IsString()
    courseId!: string;

    @ApiPropertyOptional({ description: "Date the round was played", type: Date, example: "2023-08-15T14:30:00Z" })
    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date?: Date;

    @ApiProperty({ description: "Total score for the round", example: 72 })
    @IsNumber()
    totalScore!: number;

    @ApiPropertyOptional({ description: "Additional notes about the round", example: "Played in windy conditions" })
    @IsOptional()
    @IsString()
    notes?: string;

    @ApiPropertyOptional({
        description: "Individual hole scores",
        type: [HoleScoreDto],
        isArray: true,
    })
    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HoleScoreDto)
    scores?: HoleScoreDto[];
}

export class UpdateScorecardDto extends CreateScorecardDto {
    @ApiPropertyOptional({ description: "Name of the player", example: "John Doe" })
    @IsOptional()
    @IsString()
    declare playerName: string;

    @ApiPropertyOptional({ description: "ID of the golf course", example: "123e4567-e89b-12d3-a456-426614174000" })
    @IsOptional()
    @IsString()
    declare courseId: string;

    @ApiPropertyOptional({ description: "Total score for the round", example: 72 })
    @IsOptional()
    @IsNumber()
    declare totalScore: number;
}

export class ScorecardFilterDto {
    @ApiPropertyOptional({ description: "Filter scorecards by player name", example: "John Doe" })
    @IsOptional()
    @IsString()
    playerName?: string;

    @ApiPropertyOptional({
        description: "Filter scorecards by course ID",
        example: "123e4567-e89b-12d3-a456-426614174000",
    })
    @IsOptional()
    @IsString()
    courseId?: string;
}
