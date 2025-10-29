import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createUser, findUserByEmail, findUserById } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

export async function register(req, res) {
  try {
    const { email, password, role, personalInfo, vehicleInfo } = req.body;

    if (!email || !password || !role) {
      return res.status(400).json({ message: "Email, password and role are required" });
    }

    const existing = await findUserByEmail(email);
    if (existing) {
      return res.status(400).json({ message: "Email already used" });
    }

    if (role === 'driver' && (!personalInfo || !vehicleInfo)) {
      return res.status(400).json({ message: "Drivers must provide personal and vehicle info" });
    }

    const validRoles = ["passenger", "driver"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await createUser(email, hash, role, personalInfo, vehicleInfo);

    res.status(201).json({
      id: user.id,
      email: user.email,
      role: user.role,
      personal_info: user.personal_info,
      vehicle_info: user.vehicle_info
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role || 'unknown'},
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        personal_info: user.personal_info,
        vehicle_info: user.vehicle_info 
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getProfile(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const user = await findUserById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      id: user.id,
      email: user.email,
      role: user.role,
      personal_info: user.personal_info,
      vehicle_info: user.vehicle_info
    });
  } catch (err) {
    console.error("getProfile error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
}