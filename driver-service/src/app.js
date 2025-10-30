import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import driverRoutes from "./routes/driverRoutes.js";
import redis from "./utils/redis.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Các API REST
app.use("/api", driverRoutes);

const PORT = process.env.PORT;

// ✅ Kiểm tra Redis trước khi chạy server
async function checkRedisConnection() {
  try {
    await redis.ping();
    console.log("✅ Redis connection ready");
  } catch (error) {
    console.error("❌ Redis connection error:", error);
    process.exit(1);
  }
}

// 🚀 Chạy server (phải là `server.listen`, KHÔNG dùng `app.listen`)
app.listen(PORT, async () => {
  await checkRedisConnection();
  console.log(`🚗 DriverService running on port ${PORT}`);
});
