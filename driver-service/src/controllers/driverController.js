import {
  createDriver,
  getDriverById,
  updateStatus,
} from "../models/driverModel.js";
import { updateDriverLocation, findNearbyDrivers } from "../utils/redisGeo.js";

export async function registerDriver(req, res) {
  try {
    const { name, vehicle, licensePlate } = req.body;
    if (!name || !vehicle || !licensePlate)
      return res.status(400).json({ message: "Missing fields" });

    const driver = await createDriver(name, vehicle, licensePlate);
    res.status(201).json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateDriverStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["online", "offline"].includes(status))
      return res.status(400).json({ message: "Invalid status" });

    const driver = await updateStatus(id, status);
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const { lat, lng } = req.body;
    if (!lat || !lng)
      return res.status(400).json({ message: "lat/lng required" });

    await updateDriverLocation(id, lat, lng);
    res.json({ message: "Driver location updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function searchNearby(req, res) {
  try {
    const { lat, lng, radius } = req.query;
    const drivers = await findNearbyDrivers(lat, lng, radius || 5);
    res.json({ count: drivers.length, drivers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
