import express from "express";
import {
  registerDriver,
  updateDriverStatus,
  updateLocation,
  searchNearby,
} from "../controllers/driverController.js";

const router = express.Router();

router.post("/drivers", registerDriver);
router.put("/drivers/:id/status", updateDriverStatus);
router.put("/drivers/:id/location", updateLocation);
router.get("/drivers/search", searchNearby);

export default router;
