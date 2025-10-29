import express from "express";
import {
  createTripHandler,
  getTripHandler,
  cancelTripHandler,
  completeTripHandler,
} from "../controllers/tripController.js";
import { reviewTripHandler } from "../controllers/reviewController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/trips", createTripHandler);
router.get("/trips/:id", getTripHandler);
router.post("/trips/:id/cancel", cancelTripHandler);
router.post("/trips/:id/complete", completeTripHandler);
router.post("/trips/:id/review", authMiddleware, reviewTripHandler);

export default router;
