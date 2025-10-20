import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tripRoutes from "./routes/tripRoutes.js";
import { initDB } from "./db/init.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", tripRoutes);

const PORT = process.env.PORT || 4002;
app.listen(PORT, async () => {
    await initDB();
    console.log(`🚕 TripService running on port ${PORT}`);
});
