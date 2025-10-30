import pool from "../db/db.js";

export async function createTrip(passengerId, pickup, destination, fare, status, driverId = null) {
  const res = await pool.query(
    `INSERT INTO trips (passenger_id, pickup, destination, fare, status, driver_id)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING *`,
    [passengerId, pickup, destination, fare, status, driverId]
  );
  return res.rows[0];
}

export async function getTripById(id) {
  const res = await pool.query("SELECT * FROM trips WHERE id = $1", [id]);
  return res.rows[0];
}

export async function updateTripStatus(id, status) {
  const res = await pool.query(
    "UPDATE trips SET status = $1 WHERE id = $2 RETURNING *",
    [status, id]
  );
  return res.rows[0];
}

export async function assignDriver(tripId, driverId) {
  const res = await pool.query(
    "UPDATE trips SET driver_id = $1, status = 'accepted' WHERE id = $2 RETURNING *",
    [driverId, tripId]
  );
  return res.rows[0];
}

export async function updateTripReview(tripId, rating, comment) {
  const res = await pool.query(
    `UPDATE trips
     SET rating = $1, comment = $2
     WHERE id = $3
     RETURNING *`,
    [rating, comment, tripId]
  );
  return res.rows[0];
}