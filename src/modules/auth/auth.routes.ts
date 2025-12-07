import express from "express";
import { authController } from "./auth.controller";

const router = express.Router();
// Register new user account
router.post("/signup", authController.signUpUser);
router.post("/signin", authController.signInUser);
export const authRoutes = router;
