import express from "express";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import { initDB } from "./db/init.js";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api", userRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
    await initDB();
    console.log(`UserService running on ${PORT}`);
});
