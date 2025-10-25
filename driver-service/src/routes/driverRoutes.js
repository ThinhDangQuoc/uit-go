import express from "express";
import * as driverController from "../controllers/driverController.js";

const router = express.Router();

router.post("/drivers", driverController.createDriver);
router.get("/drivers/:id", driverController.getDriver);
router.put("/drivers/:id/status", driverController.updateStatus);
router.put("/drivers/:id/location", driverController.updateLocation);
router.get("/drivers/search", driverController.searchDrivers);
router.get("/drivers/:id/trips", driverController.getDriverTrips);

export default router;