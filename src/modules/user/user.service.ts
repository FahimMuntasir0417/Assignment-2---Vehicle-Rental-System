// src/modules/users/user.service.ts
import { pool } from "../../config/db";

const getAllUser = async () => {
  const result = await pool.query("SELECT * FROM users ORDER BY id ASC");
  return result.rows;
};

const getUserById = async (id: number) => {
  const result = await pool.query(`SELECT * FROM users WHERE id = $1`, [id]);
  return result.rows[0];
};

//  Update user by ID (full update)

const updateUserById = async (id: number, payload: Record<string, unknown>) => {
  const { name, email, phone, role } = payload;

  // Required fields – simple full update
  if (!name || !email || !phone || !role) {
    throw new Error("name, email, password, phone, role are required");
  }

  const normalizedEmail = (email as string).toLowerCase();

  // Check if email already used by another user
  const emailOwner = await pool.query(
    `SELECT id FROM users WHERE email = $1 AND id <> $2`,
    [normalizedEmail, id]
  );

  if (emailOwner.rowCount && emailOwner.rowCount > 0) {
    throw new Error("Email already in use by another user");
  }

  const result = await pool.query(
    `UPDATE users
     SET name = $1,
         role = $2,
         email = $3,
        
         phone = $4
     WHERE id = $5
     RETURNING id, name, email, phone, role`,
    [name, role, normalizedEmail, phone, id]
  );

  return result.rows[0];
};

export default updateUserById;

//  Delete user by ID
const deleteUserById = async (id: number) => {
  const result = await pool.query(
    `DELETE FROM users WHERE id = $1 RETURNING *`,
    [id]
  );

  return result.rows[0];
};

export const userServices = {
  getAllUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
