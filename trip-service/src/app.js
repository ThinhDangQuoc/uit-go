import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import tripRoutes from "./routes/tripRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", tripRoutes);

const PORT = process.env.PORT || 4002;
app.listen(PORT, () => console.log(`🚕 TripService running on port ${PORT}`));
