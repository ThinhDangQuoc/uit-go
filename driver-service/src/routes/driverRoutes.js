import express from "express";
import * as driverController from "../controllers/driverController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Location updates - requires authentication
router.put("/drivers/:id/location", authMiddleware, driverController.updateLocation);
router.get("/drivers/:id/location", authMiddleware, driverController.getLocation);

// Search nearby drivers
router.get("/drivers/search", authMiddleware, driverController.searchNearbyDrivers);

// Driver notifications
router.post("/drivers/:id/notify", authMiddleware, driverController.notifyDriver);

// Driver status
router.put("/drivers/:id/status", authMiddleware, driverController.updateStatus);

export default router;