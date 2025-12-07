// src/modules/users/user.controller.ts
import { Request, Response } from "express";
import { userServices } from "./user.service";

const getUser = async (req: Request, res: Response) => {
  try {
    const users = await userServices.getAllUser();

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: users,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err.message || "Something went wrong",
    });
  }
};

//  GET by ID
const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.userId);

    const user = await userServices.getUserById(id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message || "Something went wrong",
    });
  }
};

//  UPDATE by ID
const updateUserById = async (req: Request, res: Response) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body is empty",
      });
    }

    const id = Number(req.params.userId);

    const updatedUser = await userServices.updateUserById(id, req.body);

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message,
    });
  }
};

const deleteUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.userId);

    const deletedUser = await userServices.deleteUserById(id);

    if (!deletedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (err: any) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: err?.message || "Something went wrong",
    });
  }
};

export const userController = {
  getUser,
  getUserById,
  updateUserById,
  deleteUserById,
};
