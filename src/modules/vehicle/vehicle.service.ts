import { pool } from "../../config/db";

export type VehicleType = "car" | "bike" | "van" | "SUV";
export type AvailabilityStatus = "available" | "booked";

export interface Vehicle {
  id?: number;
  vehicle_name: string;
  type: VehicleType;
  registration_number: string;
  daily_rent_price: number;
  availability_status: AvailabilityStatus;
}

const createVehicle = async (data: Vehicle) => {
  const query = `
    INSERT INTO vehicles (
      vehicle_name,
      type,
      registration_number,
      daily_rent_price,
      availability_status
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING *;
  `;

  const values = [
    data.vehicle_name,
    data.type,
    data.registration_number,
    data.daily_rent_price,
    data.availability_status,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

const getAllVehicles = async () => {
  const result = await pool.query("SELECT * FROM vehicles ORDER BY id DESC;");
  return result.rows;
};

const getVehicleById = async (id: number) => {
  const result = await pool.query("SELECT * FROM vehicles WHERE id = $1;", [
    id,
  ]);
  return result.rows[0];
};

const updateVehicle = async (id: number, data: Partial<Vehicle>) => {
  const keys = Object.keys(data);
  if (keys.length === 0) return null;

  const setClause = keys
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");

  const values = Object.values(data);
  values.push(id);

  const query = `
    UPDATE vehicles
    SET ${setClause}
    WHERE id = $${values.length}
    RETURNING *;
  `;

  const result = await pool.query(query, values);
  return result.rows[0];
};

const deleteVehicle = async (id: number) => {
  const result = await pool.query(
    "DELETE FROM vehicles WHERE id = $1 RETURNING *;",
    [id]
  );
  return result.rows[0];
};

export const vehicleService = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
