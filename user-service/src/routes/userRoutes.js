import express from "express";
import { register, login, getProfile } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/users", register);
router.post("/sessions", login);
router.get("/users/me", authMiddleware, getProfile);

export default router;