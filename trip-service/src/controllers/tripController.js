import axios from "axios";
import { createTrip, getTripById, updateTripStatus, assignDriver, updateTripReview } from "../models/tripModel.js";
import { findNearestDriver } from "../services/driverAPI.js";
import { TRIP_STATUS } from "../utils/constants.js";

export async function createTripHandler(req, res) {
  try {
    const { passengerId, pickup, destination, pickupLat, pickupLng } = req.body;

    const token = req.headers.authorization?.split(" ")[1];
    const fare = Math.floor(Math.random() * 50 + 50) * 1000;
    const trip = await createTrip(passengerId, pickup, destination, fare, TRIP_STATUS.SEARCHING);

    // Tìm tài xế gần nhất
    const nearbyDrivers = await findNearestDriver(pickupLat, pickupLng, 5, token);
    if (!nearbyDrivers.length)
      return res.status(201).json({ message: "Trip created but no drivers nearby", trip });

    const nearestDriver = nearbyDrivers[0];
    const driverId = nearestDriver.id;

    // Gửi thông báo đến driver-service
    await axios.post(
      `${process.env.DRIVER_SERVICE_URL}/drivers/${driverId}/notify`,
      { tripId: trip.id },
      {
        headers: {
          Authorization: req.headers.authorization, // chuyển token từ client
        },
      }
    );

    // Thiết lập timeout 15 giây chờ phản hồi
    setTimeout(async () => {
      const currentTrip = await getTripById(trip.id);
      if (currentTrip.status === TRIP_STATUS.SEARCHING) {
        console.log(`⏰ Driver ${driverId} did not respond in time.`);
        // tìm tài xế khác (tuỳ bạn)
      }
    }, 15000);

    res.status(201).json({
      message: "Trip created and driver notified",
      trip,
      notifiedDriver: driverId,
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

export async function acceptTripHandler(req, res) {
  const { tripId } = req.params;
  const { driverId } = req.body;

  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.status !== TRIP_STATUS.SEARCHING)
      return res.status(400).json({ message: "Trip already accepted or canceled" });

    const updated = await assignDriver(tripId, driverId);
    await updateTripStatus(tripId, TRIP_STATUS.ACCEPTED);

    res.json({ message: "Driver accepted trip", trip: updated });
  } catch (err) {
    console.error("acceptTripHandler error:", err);
    res.status(500).json({ message: err.message });
  }
}

export async function rejectTripHandler(req, res) {
  const { tripId } = req.params;
  const { driverId } = req.body;

  try {
    const trip = await getTripById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    if (trip.status !== TRIP_STATUS.SEARCHING)
      return res.status(400).json({ message: "Trip already processed" });

    console.log(`❌ Driver ${driverId} rejected trip ${tripId}`);
    res.json({ message: "Driver rejected trip" });
  } catch (err) {
    console.error("rejectTripHandler error:", err);
    res.status(500).json({ message: err.message });
  }
}
