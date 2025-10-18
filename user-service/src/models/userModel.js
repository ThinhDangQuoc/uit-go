import { pool } from "../db.js";

export async function createUser(email, passwordHash, role) {
  const res = await pool.query(
    "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING id, email, role",
    [email, passwordHash, role]
  );
  return res.rows[0];
}

export async function findUserByEmail(email) {
  const res = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
  return res.rows[0];
}
