import express from "express";
import {
  createTripHandler,
  getTripHandler,
  cancelTripHandler,
  completeTripHandler,
} from "../controllers/tripController.js";

const router = express.Router();

router.post("/trips", createTripHandler);
router.get("/trips/:id", getTripHandler);
router.post("/trips/:id/cancel", cancelTripHandler);
router.post("/trips/:id/complete", completeTripHandler);

export default router;
