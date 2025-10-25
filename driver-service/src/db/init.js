import pool from "./db.js";

export async function initDB() {
  const query = `
  CREATE TABLE IF NOT EXISTS drivers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    car_model VARCHAR(255) NOT NULL,
    license_plate VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'offline',
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    rating DECIMAL(3,2) DEFAULT 5.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;
  try {
    await pool.query(query);
    console.log("✅ [driver-service] drivers table ready");
  } catch (error) {
    console.error("❌ Error initializing database:", error);
    throw error;
  }
}