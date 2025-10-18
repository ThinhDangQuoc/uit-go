import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

export async function register(req, res) {
  const { email, password, role } = req.body;

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(400).json({ message: "Email already used" });
  }

  // Dùng bcryptjs để mã hoá mật khẩu
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await createUser(email, hash, role || "passenger");
  res.json(user);
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  // So sánh mật khẩu bằng bcryptjs
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, {
    expiresIn: "1d",
  });

  res.json({ token });
}
