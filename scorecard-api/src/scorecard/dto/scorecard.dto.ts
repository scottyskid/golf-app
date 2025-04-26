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
    @IsOptional()
    id?: string;

    @IsOptional()
    scorecardId?: string;

    @IsInt()
    @Min(1)
    holeNumber: number;

    @IsInt()
    @Min(1)
    score: number;

    @IsOptional()
    @IsInt()
    @Min(0)
    putts?: number;

    @IsOptional()
    @IsBoolean()
    fairwayHit?: boolean;
}

export class CreateScorecardDto {
    @IsString()
    playerName: string;

    @IsString()
    courseId: string;

    @IsOptional()
    @IsDate()
    @Type(() => Date)
    date?: Date;

    @IsNumber()
    totalScore: number;

    @IsOptional()
    @IsString()
    notes?: string;

    @IsOptional()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => HoleScoreDto)
    scores?: HoleScoreDto[];
}

export class UpdateScorecardDto extends CreateScorecardDto {
    @IsOptional()
    @IsString()
    playerName: string;

    @IsOptional()
    @IsString()
    courseId: string;

    @IsOptional()
    @IsNumber()
    totalScore: number;
}

export class ScorecardFilterDto {
    @IsOptional()
    @IsString()
    playerName?: string;

    @IsOptional()
    @IsString()
    courseId?: string;
}
