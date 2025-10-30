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
app.use("/api", driverRoutes);

const PORT = process.env.PORT;

// ✅ Khởi tạo HTTP + Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // hoặc chỉ định gateway URL
  },
});

// Lưu kết nối WebSocket của tài xế
const connectedDrivers = new Map();

io.on("connection", (socket) => {
  console.log("🟢 Driver connected:", socket.id);

  socket.on("register_driver", (driverId) => {
    connectedDrivers.set(driverId, socket.id);
    console.log(`✅ Driver ${driverId} registered with socket ${socket.id}`);
  });

  socket.on("disconnect", () => {
    for (const [driverId, socketId] of connectedDrivers.entries()) {
      if (socketId === socket.id) {
        connectedDrivers.delete(driverId);
        console.log(`🔴 Driver ${driverId} disconnected`);
        break;
      }
    }
  });

// Driver phản hồi chuyến đi
  socket.on("driver_response", async ({ tripId, driverId, accepted }) => {
    console.log(`🚗 Driver ${driverId} responded to trip ${tripId}: ${accepted}`);
    io.emit("trip_response", { tripId, driverId, accepted });
  });
});

// Hàm gửi thông báo tới tài xế
export function notifyDriverWS(driverId, tripData) {
  const socketId = connectedDrivers.get(driverId);
  if (socketId) {
    io.to(socketId).emit("trip_request", tripData);
    console.log(`📡 Sent trip request to driver ${driverId}`);
  } else {
    console.log(`⚠️ Driver ${driverId} not connected via socket`);
  }
}

async function checkRedisConnection() {
  try {
    await redis.ping();
    console.log('✅ Redis connection ready');
  } catch (error) {
    console.error('❌ Redis connection error:', error);
    process.exit(1);
  }
}

app.listen(PORT, async () => {
  await checkRedisConnection();
  console.log(`🚗 DriverService running on port ${PORT}`);
});
