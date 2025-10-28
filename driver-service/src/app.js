import express from "express";
import cors from "cors";
import driverRoutes from "./routes/driverRoutes.js";
import dotenv from "dotenv";
import { initDB } from "./db/init.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", driverRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, async () => {
    await initDB();
    console.log(`🚗 DriverService running on port ${PORT}`);
});
