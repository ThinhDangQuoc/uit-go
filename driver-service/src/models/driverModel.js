import pool from "../db/db.js";

export async function createDriver(userId, carModel, licensePlate) {
  const query = `
    INSERT INTO drivers (user_id, car_model, license_plate)
    VALUES ($1, $2, $3)
    RETURNING *
  `;
  const { rows } = await pool.query(query, [userId, carModel, licensePlate]);
  return rows[0];
}

export async function getDriverById(id) {
  const query = `
    SELECT * FROM drivers WHERE id = $1
  `;
  const { rows } = await pool.query(query, [id]);
  return rows[0];
}

export async function updateDriverStatus(id, status) {
  const query = `
    UPDATE drivers 
    SET status = $2
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, status]);
  return rows[0];
}

export async function updateDriverLocation(id, latitude, longitude) {
  const query = `
    UPDATE drivers 
    SET latitude = $2, longitude = $3
    WHERE id = $1
    RETURNING *
  `;
  const { rows } = await pool.query(query, [id, latitude, longitude]);
  return rows[0];
}

export async function searchNearbyDrivers(lat, lng, radius) {
  const query = `
    SELECT *, 
    (
      6371 * acos(
        cos(radians($1)) * cos(radians(latitude)) *
        cos(radians(longitude) - radians($2)) +
        sin(radians($1)) * sin(radians(latitude))
      )
    ) AS distance
    FROM drivers
    WHERE status = 'online'
    HAVING distance < $3
    ORDER BY distance
  `;
  const { rows } = await pool.query(query, [lat, lng, radius]);
  return rows;
}

export async function getDriverTrips(driverId) {
  const query = `
    SELECT * FROM trips 
    WHERE driver_id = $1 
    ORDER BY created_at DESC
  `;
  const { rows } = await pool.query(query, [driverId]);
  return rows;
}