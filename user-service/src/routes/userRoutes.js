import express from "express";
import { register, login } from "../controllers/userController.js";
const router = express.Router();

router.post("/users", register);
router.post("/sessions", login);

export default router;
