import { Request, Response } from "express";
import { bookingService } from "./bookings.service";

const createBooking = async (req: Request, res: Response) => {
  try {
    const result = await bookingService.createBooking(req.body);
    return res.status(201).json({
      success: true,
      message: "Booking created successfully",
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error?.message,
    });
  }
};

const getAllBookings = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const role = req.user.role as "admin" | "customer";
    const userId = Number(req.user.id);
    const result = await bookingService.getAllBookings(userId, role);

    res.json({
      success: true,
      message: "Bookings retrieved successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const updateBooking = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const role = req.user.role as "admin" | "customer";
    const userId = Number(req.user.id);
    const bookingId = Number(req.params.bookingId);
    const { status } = req.body as { status: "cancelled" | "returned" };

    const data = await bookingService.updateBookingStatus(
      bookingId,
      userId,
      role,
      status
    );

    const message =
      role === "customer"
        ? "Booking cancelled successfully"
        : "Booking marked as returned. Vehicle is now available";

    return res.status(200).json({
      success: true,
      message,
      data,
    });
  } catch (error: any) {
    return res.status(error?.status || 500).json({
      success: false,
      message: error?.message || "Something went wrong",
    });
  }
};

export const bookingController = {
  createBooking,
  getAllBookings,
  updateBooking,
};
