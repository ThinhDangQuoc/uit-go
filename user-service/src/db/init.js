import pool from "./db.js";

export async function initDB() {
  const query = `
  CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    personal_info JSONB,
    vehicle_info JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  await pool.query(query);
  console.log("✅ [user-service] users table ready");
}
