import { createTrip, getTripById, updateTripStatus, assignDriver, updateTripReview } from "../models/tripModel.js";
import { findNearestDriver } from "../services/driverAPI.js";
import { TRIP_STATUS } from "../utils/constants.js";

export async function createTripHandler(req, res) {
  try {
    const { passengerId, pickup, destination, pickupLat, pickupLng } = req.body;

    const trip = await createTrip(passengerId, pickup, destination, 50000, TRIP_STATUS.SEARCHING);

    // Tìm tài xế gần nhất
    const nearbyDrivers = await findNearestDriver(pickupLat, pickupLng, 5);
    if (!nearbyDrivers.length) {
      return res.status(201).json({ message: "No drivers nearby", trip });
    }

    const nearestDriver = nearbyDrivers[0];
    console.log(`🚗 Notifying driver ${nearestDriver.id} for trip ${trip.id}`);

    // Gửi thông báo qua socket
    socket.emit("trip_request", {
      driverId: nearestDriver.id,
      tripId: trip.id,
      pickup,
      destination,
    });

    // Chờ phản hồi trong 15 giây
    let accepted = false;
    const timeout = setTimeout(async () => {
      if (!accepted) {
        console.log(`⌛ Driver ${nearestDriver.id} did not respond, resetting trip`);
        await updateTripStatus(trip.id, TRIP_STATUS.SEARCHING);
      }
    }, 15000);

    // Lắng nghe phản hồi từ driver-service
    socket.on("driver_response", async (data) => {
      if (data.tripId === trip.id && data.driverId === nearestDriver.id) {
        clearTimeout(timeout);
        if (data.status === "accepted") {
          accepted = true;
          await assignDriver(trip.id, nearestDriver.id);
          await updateTripStatus(trip.id, TRIP_STATUS.ACCEPTED);
          console.log(`✅ Driver ${data.driverId} accepted trip ${data.tripId}`);
        } else {
          console.log(`❌ Driver ${data.driverId} rejected trip ${data.tripId}`);
          await updateTripStatus(trip.id, TRIP_STATUS.SEARCHING);
        }
      }
    });

    res.status(201).json({
      message: "Trip created and driver notified",
      trip,
      notifiedDriver: nearestDriver.id,
    });
  } catch (err) {
    console.error("createTripHandler error:", err);
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