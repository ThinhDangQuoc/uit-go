import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const DRIVER_URL = process.env.DRIVER_SERVICE_URL;

export async function findNearestDriver(lat, lng, radius = 5) {
  const url = `${DRIVER_URL}/drivers/search?lat=${lat}&lng=${lng}&radius=${radius}`;
  const res = await axios.get(url);
  return res.data.drivers || [];
}
