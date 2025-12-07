import express from "express";
import { bookingController } from "./bookings.controller";
import auth from "../../middlewere/auth";

const router = express.Router();

//  POST  /api/v1/bookings  -> Admin or Customer
router.post("/", auth("admin", "customer"), bookingController.createBooking);

// GET /api/v1/bookings   ->    Role-based
router.get("/", auth(), bookingController.getAllBookings);

//  PUT /api/v1/bookings/:bookingId  -> 	Role-based
router.put("/:bookingId", auth(), bookingController.updateBooking);

export const bookingRoutes = router;
