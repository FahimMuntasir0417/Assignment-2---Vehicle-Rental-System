// src/modules/users/user.routes.ts
import express from "express";
import { userController } from "./user.controller";
import auth from "../../middlewere/auth";

const router = express.Router();
// get all users   -> admin only
router.get("/", auth("admin"), userController.getUser);

// Get by ID    -> GET /api/v1/users/1
router.get("/:userId", userController.getUserById);

// UPDATE by ID -> PUT /api/v1/users/1  (admin only)
router.put(
  "/:userId",
  auth("admin", "customer"),
  userController.updateUserById
);

// DELETE by ID -> DELETE /api/v1/users/1   (admin only)
router.delete("/:userId", auth("admin"), userController.deleteUserById);

export const userRoutes = router;
