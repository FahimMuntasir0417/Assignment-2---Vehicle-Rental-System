import express from "express";
import { vehicleController } from "./vehicle.controller";
import auth from "../../middlewere/auth";

const router = express.Router();

// POST /api/v1/vehicles  -> Admin only
router.post("/", auth(), vehicleController.createVehicle);

// GET /api/v1/vehicles   -> Public
router.get("/", vehicleController.getAllVehicles);

// GET /api/v1/vehicles/:vehicleId -> Public
router.get("/:vehicleId", vehicleController.getVehicleById);

// PUT /api/v1/vehicles/:vehicleId -> Admin only
router.put("/:vehicleId", vehicleController.updateVehicle);

// DELETE /api/v1/vehicles/:vehicleId -> Admin only
router.delete("/:vehicleId", vehicleController.deleteVehicle);

export const vehicleRoutes = router;
