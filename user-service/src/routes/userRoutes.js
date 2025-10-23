import express from "express";
import { register, login } from "../controllers/userController.js";
import { authMiddleware } from "../middleware/authmiddleWare.js";
import { getProfile } from "../controllers/userController.js";

router.get("/users/me", authMiddleware, getProfile);

const router = express.Router();

router.post("/users", register);
router.post("/sessions", login);

export default router;
export async function getProfile(req, res) {
  const user = await findUserByEmail(req.user.email);
  res.json(user);
}
