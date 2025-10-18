import { redis } from "../db.js";

export async function updateDriverLocation(driverId, lat, lng) {
  await redis.geoadd("drivers:locations", lng, lat, driverId);
}

export async function findNearbyDrivers(lat, lng, radiusKm = 5) {
  return await redis.georadius(
    "drivers:locations",
    lng,
    lat,
    radiusKm,
    "km",
    "WITHDIST"
  );
}
