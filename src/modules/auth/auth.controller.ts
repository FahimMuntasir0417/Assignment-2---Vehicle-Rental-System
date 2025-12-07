import { Request, Response } from "express";
import { authServices } from "./auth.service";

const signUpUser = async (req: Request, res: Response) => {
  try {
    const user = await authServices.signUpUser(req.body);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: user,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      message: err?.message || "Something went wrong",
    });
  }
};

const signInUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const result = await authServices.signInUser(email, password);

    if (result === null) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (result === false) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

export const authController = {
  signUpUser,
  signInUser,
};
