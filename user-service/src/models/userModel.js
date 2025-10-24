import pool from "../db/db.js";

// Tạo user mới
export async function createUser(email, password_hash, role) {
  const res = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
    [email, password_hash, role]
  );
  return res.rows[0];
}

// Tìm user theo email
export async function findUserByEmail(email) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
}

// 🔥 Bổ sung: tìm user theo id
export async function findUserById(id) {
  const res = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
  return res.rows[0];
}