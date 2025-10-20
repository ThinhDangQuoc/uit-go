import pool from "./db.js";

export async function initDB() {
  const query = `
  CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER NOT NULL,
    driver_id INTEGER,
    origin VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  await pool.query(query);
  console.log("✅ [trip-service] trips table ready");
}
