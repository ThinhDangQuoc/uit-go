import pool from "../db/db.js";

export async function createReview(tripId, passengerId, driverId, rating, comment) {
  const res = await pool.query(
    `INSERT INTO reviews (trip_id, passenger_id, driver_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [tripId, passengerId, driverId, rating, comment]
  );
  return res.rows[0];
}

export async function getReviewsByDriver(driverId) {
  const res = await pool.query("SELECT * FROM reviews WHERE driver_id = $1", [driverId]);
  return res.rows;
}
