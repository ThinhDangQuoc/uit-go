import pool from "./db.js";

export async function initDB() {
  const queryTrips = `
  CREATE TABLE IF NOT EXISTS trips (
    id SERIAL PRIMARY KEY,
    passenger_id INTEGER NOT NULL,
    driver_id INTEGER,
    pickup VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    fare NUMERIC(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'searching',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

  const queryReviews = `
  CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    trip_id INTEGER REFERENCES trips(id) ON DELETE CASCADE,
    passenger_id INTEGER NOT NULL,
    driver_id INTEGER NOT NULL,
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  `;

  await pool.query(queryTrips);
  await pool.query(queryReviews);
  console.log("[trip-service] trips & reviews tables ready");
}
