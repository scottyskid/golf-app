import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    HttpCode,
    HttpStatus,
    UsePipes,
    ValidationPipe,
    BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody, ApiQuery } from "@nestjs/swagger";
import { Scorecard, HoleScore } from "@prisma/client";

import { CreateScorecardDto, UpdateScorecardDto, ScorecardFilterDto } from "./scorecard.dto";
import { ScorecardModel, ErrorResponse } from "./scorecard.model";
import { ScorecardService } from "./scorecard.service";

@ApiTags("scorecard")
@Controller("scorecard")
export class ScorecardController {
    constructor(private readonly scorecardService: ScorecardService) {}

    /**
     * Get all scorecards with optional filtering
     */
    @ApiOperation({ summary: "Get all scorecards", description: "Retrieve all scorecards with optional filtering" })
    @ApiQuery({ type: ScorecardFilterDto, required: false })
    @ApiResponse({ status: 200, description: "Successfully retrieved scorecards", type: [ScorecardModel] })
    @Get()
    getAllScorecards(@Query() filter: ScorecardFilterDto): Promise<(Scorecard & { scores: HoleScore[] })[]> {
        return this.scorecardService.getAllScorecards(filter);
    }

    /**
     * Get a single scorecard by ID
     */
    @ApiOperation({ summary: "Get scorecard by ID", description: "Retrieve a specific scorecard by its ID" })
    @ApiParam({ name: "id", description: "Scorecard ID" })
    @ApiResponse({ status: 200, description: "Successfully retrieved scorecard", type: ScorecardModel })
    @ApiResponse({ status: 404, description: "Scorecard not found", type: ErrorResponse })
    @Get(":id")
    getScorecardById(@Param("id") id: string): Promise<Scorecard & { scores: HoleScore[] }> {
        return this.scorecardService.getScorecardById(id);
    }

    /**
     * Create a new scorecard
     */
    @ApiOperation({ summary: "Create scorecard", description: "Create a new scorecard" })
    @ApiBody({ type: CreateScorecardDto })
    @ApiResponse({ status: 201, description: "Scorecard created successfully", type: ScorecardModel })
    @ApiResponse({ status: 400, description: "Bad request - validation error", type: ErrorResponse })
    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UsePipes(
        new ValidationPipe({
            transform: true,
            whitelist: true,
            forbidNonWhitelisted: true,
            errorHttpStatusCode: HttpStatus.BAD_REQUEST,
        }),
    )
    async createScorecard(@Body() data: CreateScorecardDto): Promise<Scorecard & { scores: HoleScore[] }> {
        try {
            return await this.scorecardService.createScorecard(data);
        } catch (error: Error | unknown) {
            if (error instanceof Error && error.name === "ValidationError") {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    /**
     * Update an existing scorecard
     */
    @ApiOperation({ summary: "Update scorecard", description: "Update an existing scorecard" })
    @ApiParam({ name: "id", description: "Scorecard ID" })
    @ApiBody({ type: UpdateScorecardDto })
    @ApiResponse({ status: 200, description: "Scorecard updated successfully", type: ScorecardModel })
    @ApiResponse({ status: 404, description: "Scorecard not found", type: ErrorResponse })
    @ApiResponse({ status: 400, description: "Bad request - validation error", type: ErrorResponse })
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
    @ApiOperation({ summary: "Delete scorecard", description: "Remove a scorecard" })
    @ApiParam({ name: "id", description: "Scorecard ID" })
    @ApiResponse({ status: 204, description: "Scorecard deleted successfully" })
    @ApiResponse({ status: 404, description: "Scorecard not found", type: ErrorResponse })
    @Delete(":id")
    @HttpCode(204)
    deleteScorecard(@Param("id") id: string): Promise<Scorecard> {
        return this.scorecardService.deleteScorecard(id);
    }
}
