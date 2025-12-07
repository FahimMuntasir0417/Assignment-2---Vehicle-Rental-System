import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();

// Register new user account -> /api/v1/auth/signup
router.post("/signup", authController.signUpUser);

// Login new user account -> /api/v1/auth/signin
router.post("/signin", authController.signInUser);

export const authRoutes = router;
