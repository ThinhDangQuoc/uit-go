import { createTrip, getTripById, updateTripStatus, assignDriver, updateTripReview } from "../models/tripModel.js";
import { findNearestDriver } from "../services/driverAPI.js";
import { TRIP_STATUS } from "../utils/constants.js";

export async function createTripHandler(req, res) {
  try {
    const { passengerId, pickup, destination, pickupLat, pickupLng } = req.body;
    if (!passengerId || !pickup || !destination || !pickupLat || !pickupLng)
      return res.status(400).json({ message: "Missing fields" });

    // Tính giá cước giả lập
    const fare = Math.floor(Math.random() * 50 + 50) * 1000;

    // Tạo chuyến đi mới
    const trip = await createTrip(passengerId, pickup, destination, fare, TRIP_STATUS.SEARCHING);

    // Gọi DriverService
    const nearbyDrivers = await findNearestDriver(pickupLat, pickupLng, 5);
    console.log("Nearby drivers:", nearbyDrivers);

    if (nearbyDrivers.length > 0) {
      const nearestDriver = nearbyDrivers[0];
      const updatedTrip = await assignDriver(trip.id, nearestDriver.driverId);
      return res.status(201).json({
        message: "Trip created and driver assigned",
        trip: updatedTrip,
        driver: nearestDriver,
      });
    }

    res.status(201).json({
      message: "Trip created but no drivers nearby",
      trip,
    });
  } catch (err) {
    console.error("❌ createTripHandler error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function getTripHandler(req, res) {
  try {
    const { id } = req.params;
    const trip = await getTripById(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function cancelTripHandler(req, res) {
  try {
    const { id } = req.params;
    const trip = await getTripById(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status === TRIP_STATUS.COMPLETED)
      return res.status(400).json({ message: "Trip already completed" });

    const updated = await updateTripStatus(id, TRIP_STATUS.CANCELED);
    res.json({ message: "Trip canceled", trip: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function completeTripHandler(req, res) {
  try {
    const { id } = req.params;
    const trip = await getTripById(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status !== TRIP_STATUS.ACCEPTED && trip.status !== TRIP_STATUS.IN_PROGRESS)
      return res.status(400).json({ message: "Trip not active" });

    const updated = await updateTripStatus(id, TRIP_STATUS.COMPLETED);
    res.json({ message: "Trip completed", trip: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function reviewTripHandler(req, res) {
  try {
    const { id } = req.params; // trip id
    const { rating, comment } = req.body;
    const passengerId = req.user?.id;

    if (!rating || rating < 1 || rating > 5)
      return res.status(400).json({ message: "Rating must be between 1 and 5" });

    const trip = await getTripById(id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.status !== "completed")
      return res.status(400).json({ message: "Trip must be completed to review" });

    if (trip.passenger_id !== passengerId)
      return res.status(403).json({ message: "You are not allowed to review this trip" });

    const updated = await updateTripReview(trip.id, rating, comment || "");
    res.status(201).json({ message: "Review submitted", trip: updated });
  } catch (err) {
    console.error("reviewTripHandler error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function getReviewsByDriverHandler(req, res) {
  try {
    const { driverId } = req.params;
    const reviews = await getReviewsByDriver(driverId);

    if (!reviews.length)
      return res.status(404).json({ message: "No reviews found for this driver" });

    res.json({ driverId, total: reviews.length, reviews });
  } catch (err) {
    console.error("getReviewsByDriverHandler error:", err);
    res.status(500).json({ message: err.message });
  }
}