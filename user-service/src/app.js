import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import { initDB } from "./db/init.js";
import morgan from "morgan";
app.use(morgan("dev"));

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  initDB()
    .then(() => console.log("✅ Database ready"))
    .catch((err) => console.error("❌ DB init failed:", err));
  console.log(`UserService running on port ${PORT}`);
});