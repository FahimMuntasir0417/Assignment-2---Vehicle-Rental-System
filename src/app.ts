import express from "express";

import dotenv from "dotenv";
import path from "path";
import initDB from "./config/db";

import { authRoutes } from "./modules/auth/auth.routes";
import { userRoutes } from "./modules/user/user.routes";
import { vehicleRoutes } from "./modules/vehicle/vehicle.routes";
import { bookingRoutes } from "./modules/bookings/bookings.routes";

dotenv.config({ path: path.join(process.cwd(), ".env") });
const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello World!!!");
});

//  auth routes
app.use("/api/v1/auth", authRoutes);

// user route
app.use("/api/v1/users", userRoutes);

//  vehicle route
app.use("/api/v1/vehicles", vehicleRoutes);

// bookings route
app.use("/api/v1/booking", bookingRoutes);

initDB().catch((err) => {
  console.log("DB init Failed", err);
});

export default app;
