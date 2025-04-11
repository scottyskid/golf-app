import { Router } from "express";

import { scorecardController } from "../controllers/scorecardController";

const router = Router();

// GET all scorecards with optional filtering
router.get("/", scorecardController.getAllScorecards);

// GET a single scorecard by ID
router.get("/:id", scorecardController.getScorecardById);

// POST create a new scorecard
router.post("/", scorecardController.createScorecard);

// PUT update an existing scorecard
router.put("/:id", scorecardController.updateScorecard);

// DELETE a scorecard
router.delete("/:id", scorecardController.deleteScorecard);

export default router;
