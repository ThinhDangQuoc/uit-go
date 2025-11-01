import express from "express";
import http from "http";
import { Server } from "socket.io";
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
const server = http.createServer(app);

// ✅ Khởi tạo Socket.IO
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc domain frontend của bạn
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log(`🚘 Driver connected: ${socket.id}`);

  // 📡 Driver gửi vị trí mỗi vài giây
  socket.on("driverLocationUpdate", async ({ driverId, lat, lng }) => {
    try {
      await redis.geoadd("drivers_locations", lng, lat, driverId);
      io.emit("driverLocationBroadcast", { driverId, lat, lng }); // Gửi cho mọi passenger
      console.log(`📍 Updated location for driver ${driverId}: ${lat}, ${lng}`);
    } catch (err) {
      console.error("Redis GEOADD error:", err.message);
    }
  });

  socket.on("disconnect", () => {
    console.log(`❌ Driver disconnected: ${socket.id}`);
  });
});

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
