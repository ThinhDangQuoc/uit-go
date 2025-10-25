import * as driverModel from "../models/driverModel.js";

export async function createDriver(req, res) {
  try {
    const { userId, carModel, licensePlate } = req.body;
    const driver = await driverModel.createDriver(userId, carModel, licensePlate);
    res.status(201).json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getDriver(req, res) {
  try {
    const { id } = req.params;
    const driver = await driverModel.getDriverById(id);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateStatus(req, res) {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!["online", "offline"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    const driver = await driverModel.updateDriverStatus(id, status);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json({ status: driver.status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function updateLocation(req, res) {
  try {
    const { id } = req.params;
    const { latitude, longitude } = req.body;
    if (!latitude || !longitude) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }
    const driver = await driverModel.updateDriverLocation(id, latitude, longitude);
    if (!driver) {
      return res.status(404).json({ error: "Driver not found" });
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function searchDrivers(req, res) {
  try {
    const { lat, lng, radius = 5 } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "Latitude and longitude required" });
    }
    const drivers = await driverModel.searchNearbyDrivers(
      parseFloat(lat),
      parseFloat(lng),
      parseFloat(radius)
    );
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export async function getDriverTrips(req, res) {
  try {
    const { id } = req.params;
    const trips = await driverModel.getDriverTrips(id);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}