import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode } from "@nestjs/common";
import { Scorecard, HoleScore } from "@prisma/client";

import { CreateScorecardDto, UpdateScorecardDto, ScorecardFilterDto } from "./dto/scorecard.dto";
import { ScorecardService } from "./scorecard.service";

@Controller("scorecard")
export class ScorecardController {
    constructor(private readonly scorecardService: ScorecardService) {}

    /**
     * Get all scorecards with optional filtering
     */
    @Get()
    getAllScorecards(@Query() filter: ScorecardFilterDto): Promise<(Scorecard & { scores: HoleScore[] })[]> {
        return this.scorecardService.getAllScorecards(filter);
    }

    /**
     * Get a single scorecard by ID
     */
    @Get(":id")
    getScorecardById(@Param("id") id: string): Promise<Scorecard & { scores: HoleScore[] }> {
        return this.scorecardService.getScorecardById(id);
    }

    /**
     * Create a new scorecard
     */
    @Post()
    createScorecard(@Body() data: CreateScorecardDto): Promise<Scorecard & { scores: HoleScore[] }> {
        return this.scorecardService.createScorecard(data);
    }

    /**
     * Update an existing scorecard
     */
    @Put(":id")
    updateScorecard(
        @Param("id") id: string,
        @Body() data: UpdateScorecardDto,
    ): Promise<Scorecard & { scores: HoleScore[] }> {
        return this.scorecardService.updateScorecard(id, data);
    }

    /**
     * Delete a scorecard
     */
    @Delete(":id")
    @HttpCode(204)
    deleteScorecard(@Param("id") id: string): Promise<Scorecard> {
        return this.scorecardService.deleteScorecard(id);
    }
}
