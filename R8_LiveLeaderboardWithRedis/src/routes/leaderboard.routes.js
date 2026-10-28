import express from "express";

import {
  addScore,
  getLeaderboard,
  getPlayer,
} from "../controllers/leaderboard.controller.js";

const router = express.Router();

// Add / increase player's score
router.post("/score", addScore);

// Get complete leaderboard
router.get("/", getLeaderboard);

// Get particular player's score and rank
router.get("/:player", getPlayer);

export default router;