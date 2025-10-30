import axios from "axios";
import redis, { KEYS } from "../utils/redis.js";

const TRIP_SERVICE_URL = process.env.TRIP_SERVICE_URL;

export async function updateLocation(req, res) {
  const { id } = req.params;
  const { lat, lng } = req.body;

  // Verify driver owns this location update
  if (req.user.role !== 'driver' || req.user.id != id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }
  
  if (!lat || !lng) {
    return res.status(400).json({ message: 'Missing location coordinates' });
  }

  try {
    // Store in Redis geospatial
    await redis.geoadd(KEYS.DRIVERS_LOCATIONS, lng, lat, id);
    res.json({ message: 'Location updated' });
  } catch (error) {
    console.error('Update location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getLocation(req, res) {
  const { id } = req.params;

  try {
    const position = await redis.geopos(KEYS.DRIVERS_LOCATIONS, id);
    if (!position[0]) {
      return res.status(404).json({ message: 'Driver location not found' });
    }
    res.json({ lat: position[0][1], lng: position[0][0] });
  } catch (error) {
    console.error('Get location error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function searchNearbyDrivers(req, res) {
  const { lat, lng, radius = 5 } = req.query; // Default 5km radius

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Missing location coordinates' });
  }

  try {
    // Redis GEO radius search
    const nearby = await redis.georadius(
      KEYS.DRIVERS_LOCATIONS, // key
      lng,                    // longitude
      lat,                    // latitude
      radius,                 // radius value
      'km',                   // unit
      'WITHCOORD'             // include coordinates
    );

    // Map to a cleaner format
    const drivers = nearby.map(([id, [long, lati]]) => ({
      id,
      lat: lati,
      lng: long,
      // Could add distance if needed using geodist
    }));

    res.json(drivers);
  } catch (error) {
    console.error('Search drivers error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function notifyDriver(req, res) {
  const { id } = req.params;
  const { tripId } = req.body;

  if (!tripId) {
    return res.status(400).json({ message: 'Missing tripId' });
  }

  try {
    // Here you would implement actual notification logic
    // For example: WebSocket, Push Notification, etc.
    console.log(`🔔 Notifying driver ${id} of trip ${tripId}`);
    
    // For now, just acknowledge
    res.json({ message: 'Notification sent' });
  } catch (error) {
    console.error('Notify driver error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

export async function acceptTrip(req, res) {
  const { id, tripId } = req.params; // driverId, tripId
  try {
    console.log(`✅ Driver ${id} accepted trip ${tripId}`);

    // Lấy token từ request của client (tài xế)
    const authHeader = req.headers.authorization;

    await axios.post(
      `${TRIP_SERVICE_URL}/trips/${tripId}/accept`,
      { driverId: id },
      {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    res.json({ message: "Trip accepted successfully" });
  } catch (err) {
    console.error("Accept trip error:", err?.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
}

export async function rejectTrip(req, res) {
  const { id, tripId } = req.params;
  try {
    console.log(`❌ Driver ${id} rejected trip ${tripId}`);

    const authHeader = req.headers.authorization;

    await axios.post(
      `${TRIP_SERVICE_URL}/trips/${tripId}/reject`,
      { driverId: id },
      {
        headers: {
          ...(authHeader ? { Authorization: authHeader } : {}),
          "Content-Type": "application/json",
        },
        timeout: 5000,
      }
    );

    res.json({ message: "Trip rejected successfully" });
  } catch (err) {
    console.error("Reject trip error:", err?.response?.data || err.message);
    res.status(500).json({ message: err.message });
  }
}

export async function updateStatus(req, res) {
  const { id } = req.params;
  const { status } = req.body;

  if (req.user.role !== 'driver' || req.user.id != id) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  if (!['online', 'offline'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }

  try {
    // Store driver status
    await redis.set(`${KEYS.DRIVER_STATUS}${id}`, status);

    if (status === 'offline') {
      // Remove from locations when offline
      await redis.zrem(KEYS.DRIVERS_LOCATIONS, id);
    }

    res.json({ message: `Status updated to ${status}` });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}