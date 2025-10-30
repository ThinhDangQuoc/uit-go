import express from "express";
import {
  createTripHandler,
  getTripHandler,
  cancelTripHandler,
  completeTripHandler,
  reviewTripHandler,
  acceptTripHandler,
  rejectTripHandler
} from "../controllers/tripController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/trips", authMiddleware, createTripHandler);
router.get("/trips/:id", authMiddleware, getTripHandler);
router.post("/trips/:id/cancel", authMiddleware, cancelTripHandler);
router.post("/trips/:id/complete", authMiddleware, completeTripHandler);
router.post("/trips/:id/review", authMiddleware, reviewTripHandler);
router.post("/trips/:tripId/accept", acceptTripHandler);
router.post("/trips/:tripId/reject", rejectTripHandler);


export default router;
