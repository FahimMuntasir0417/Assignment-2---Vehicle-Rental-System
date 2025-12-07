import { Request, Response } from "express";
import { vehicleService } from "./vehicle.service";

const createVehicle = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.createVehicle(req.body);
    res.status(201).json({
      success: true,
      message: "Vehicle created successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getAllVehicles = async (req: Request, res: Response) => {
  try {
    const result = await vehicleService.getAllVehicles();
    res.json({
      success: true,
      message: "Vehicles retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const getVehicleById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.vehicleId);
    const result = await vehicleService.getVehicleById(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    res.json({ success: true, data: result });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const updateVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.vehicleId);
    const result = await vehicleService.updateVehicle(id, req.body);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    res.json({
      success: true,
      message: "Vehicle updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.vehicleId);
    const result = await vehicleService.deleteVehicle(id);

    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    res.json({
      success: true,
      message: "Vehicle deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const vehicleController = {
  createVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
};
