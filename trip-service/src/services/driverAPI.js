import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DRIVER_URL = process.env.DRIVER_SERVICE_URL;

export async function findNearestDriver(lat, lng, radius = 5) {
  try {
    const url = `${DRIVER_URL}/drivers/search?lat=${lat}&lng=${lng}&radius=${radius}`;
    const res = await axios.get(url);

    // Chuẩn hóa kết quả
    const drivers = (res.data.drivers || []).map(d => {
      if (Array.isArray(d)) {
        return { driverId: d[0], distance_km: parseFloat(d[1]) };
      }
      return d;
    });
    return drivers;
  } catch (err) {
    console.error("❌ findNearestDriver error:", err.message);
    return [];
  }
}
