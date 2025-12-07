import { pool } from "../../config/db";
import bcrypt from "bcryptjs";
import config from "../../config/index";
import jwt from "jsonwebtoken";

const signUpUser = async (payload: Record<string, unknown>) => {
  const { name, email, password, phone, role } = payload;

  if (!name || !email || !password || !phone || !role) {
    throw new Error("name, email, password, phone, role are required");
  }

  const normalizedEmail = (email as string).toLowerCase();

  // email already exists check
  const emailExited = await pool.query(
    `SELECT id FROM users WHERE email = $1`,
    [normalizedEmail]
  );

  if (emailExited.rowCount && emailExited.rowCount > 0) {
    throw new Error("Email already exists");
  }

  // password hashing
  const hashedPassword = await bcrypt.hash(password as string, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password, phone, role)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, name, email, phone, role`,
    [name, normalizedEmail, hashedPassword, phone, role]
  );

  return result.rows[0];
};

const signInUser = async (email: string, password: string) => {
  const result = await pool.query(`SELECT * FROM users WHERE email=$1`, [
    email,
  ]);

  if (result.rows.length === 0) {
    return null; // user not found
  }

  const user = result.rows[0];
  const match = await bcrypt.compare(password, user.password);

  // password mismatch
  if (!match) {
    return false;
  }

  const token = jwt.sign(
    { id: user.id, name: user.name, email: user.email, role: user.role },
    config.jwt_Secreat as string,
    { expiresIn: "7d" }
  );

  return { token, user };
};

export const authServices = {
  signUpUser,
  signInUser,
};
