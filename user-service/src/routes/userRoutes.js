import express from "express";
import { register, login, getProfile } from "../controllers/userController.js";
import { authmiddleWare } from "../middleware/authmiddleWare.js";

const router = express.Router();

router.post("/users", register);
router.post("/sessions", login);
router.get("/users/me", authmiddleWare, getProfile);

export default router;
