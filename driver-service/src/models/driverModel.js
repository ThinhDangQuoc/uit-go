import pool from "../db/db.js";

export async function createDriver(name, vehicle, licensePlate) {
  const res = await pool.query(
    `INSERT INTO drivers (name, vehicle, license_plate, status)
     VALUES ($1, $2, $3, 'offline')
     RETURNING id, name, vehicle, license_plate, status`,
    [name, vehicle, licensePlate]
  );
  return res.rows[0];
}

export async function getDriverById(id) {
  const res = await pool.query("SELECT * FROM drivers WHERE id = $1", [id]);
  return res.rows[0];
}

export async function updateStatus(id, status) {
  const res = await pool.query(
    "UPDATE drivers SET status = $1 WHERE id = $2 RETURNING id, name, status",
    [status, id]
  );
  return res.rows[0];
}
