import express from "express";
import {
  createTripHandler,
  getTripHandler,
  cancelTripHandler,
  completeTripHandler,
  reviewTripHandler
} from "../controllers/tripController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/trips", authMiddleware, createTripHandler);
router.get("/trips/:id", authMiddleware, getTripHandler);
router.post("/trips/:id/cancel", authMiddleware, cancelTripHandler);
router.post("/trips/:id/complete", authMiddleware, completeTripHandler);
router.post("/trips/:id/review", authMiddleware, reviewTripHandler);

export default router;
