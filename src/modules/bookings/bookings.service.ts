import { pool } from "../../config/db";

export type BookingStatus = "active" | "cancelled" | "returned";

export interface Booking {
  id?: number;
  customer_id: number;
  vehicle_id: number;
  rent_start_date: string; // ISO or 'YYYY-MM-DD'
  rent_end_date: string;
  total_price: number;
  status: BookingStatus;
}

export interface BookingWithVehicle extends Booking {
  customer?: {
    name: string;
    email: string;
  };
  vehicle: {
    vehicle_name: string;
    daily_rent_price?: number;
    registration_number?: string;
    type?: string;
  };
}

// Helper to safely format any DB date to "YYYY-MM-DD"
const formatDate = (value: any): string => {
  const d = new Date(value);
  if (isNaN(d.getTime())) {
    return String(value);
  }
  return d.toISOString().slice(0, 10);
};

const daysBetween = (startDate: string, endDate: string): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    throw new Error("Invalid date format");
  }

  const diffMs = end.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
  const oneDayMs = 24 * 60 * 60 * 1000;
  const days = Math.ceil(diffMs / oneDayMs);

  if (days <= 0) {
    throw new Error("rent_end_date must be after rent_start_date");
  }

  return days;
};

const createBooking = async (data: Booking): Promise<BookingWithVehicle> => {
  const {
    customer_id,
    vehicle_id,
    rent_start_date,
    rent_end_date,
    // total_price,
    // status,
  } = data;

  // 1. Check vehicle
  const vehicleQuery = `
    SELECT id, vehicle_name, daily_rent_price, availability_status
    FROM vehicles
    WHERE id = $1;
  `;
  const vehicleResult = await pool.query(vehicleQuery, [vehicle_id]);
  const vehicle = vehicleResult.rows[0];

  if (!vehicle) {
    const err: any = new Error("Vehicle not found");
    err.status = 404;
    throw err;
  }

  if (vehicle.availability_status !== "available") {
    const err: any = new Error("Vehicle is not available");
    err.status = 400;
    throw err;
  }

  // 2. Calculate total_price
  const days = daysBetween(rent_start_date, rent_end_date);
  const total_price = Number(vehicle.daily_rent_price) * days;

  // 3. Insert booking
  const insertQuery = `
    INSERT INTO bookings (
      customer_id,
      vehicle_id,
      rent_start_date,
      rent_end_date,
      total_price,
      status
    )
    VALUES ($1, $2, $3, $4, $5, 'active')
    RETURNING *;
  `;

  const insertValues = [
    customer_id,
    vehicle_id,
    rent_start_date,
    rent_end_date,
    total_price,
  ];

  const insertResult = await pool.query(insertQuery, insertValues);
  const bookingRow = insertResult.rows[0];

  // 4. Update vehicle
  const updateVehicleQuery = `
    UPDATE vehicles
    SET availability_status = 'booked'
    WHERE id = $1;
  `;
  await pool.query(updateVehicleQuery, [vehicle_id]);

  // 5. Build response object
  const response: BookingWithVehicle = {
    id: bookingRow.id,
    customer_id: bookingRow.customer_id,
    vehicle_id: bookingRow.vehicle_id,
    rent_start_date: formatDate(bookingRow.rent_start_date),
    rent_end_date: formatDate(bookingRow.rent_end_date),
    total_price: Number(bookingRow.total_price),
    status: bookingRow.status,
    vehicle: {
      vehicle_name: vehicle.vehicle_name,
      daily_rent_price: Number(vehicle.daily_rent_price),
    },
  };

  return response;
};

const getAllBookings = async (
  userId: number,
  role: string
): Promise<BookingWithVehicle[]> => {
  if (role === "admin") {
    const query = `
      SELECT 
        b.*,
        u.name AS customer_name,
        u.email AS customer_email,
        v.vehicle_name,
        v.registration_number
      FROM bookings b
      JOIN users u ON b.customer_id = u.id
      JOIN vehicles v ON b.vehicle_id = v.id
      ORDER BY b.id DESC;
    `;

    const result = await pool.query(query);

    return result.rows.map(
      (row: any): BookingWithVehicle => ({
        id: row.id,
        customer_id: row.customer_id,
        vehicle_id: row.vehicle_id,
        rent_start_date: formatDate(row.rent_start_date),
        rent_end_date: formatDate(row.rent_end_date),
        total_price: Number(row.total_price),
        status: row.status,

        customer: {
          name: row.customer_name,
          email: row.customer_email,
        },

        vehicle: {
          vehicle_name: row.vehicle_name,
          registration_number: row.registration_number,
        },
      })
    );
  }

  // CUSTOMER: only own bookings
  const query = `
    SELECT 
      b.id,
      b.customer_id,
      b.vehicle_id,
      b.rent_start_date,
      b.rent_end_date,
      b.total_price,
      b.status,
      v.vehicle_name,
      v.registration_number,
      v.type
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.customer_id = $1
    ORDER BY b.id DESC;
  `;

  const result = await pool.query(query, [userId]);

  return result.rows.map(
    (row: any): BookingWithVehicle => ({
      id: row.id,
      customer_id: row.customer_id,
      vehicle_id: row.vehicle_id,
      rent_start_date: formatDate(row.rent_start_date),
      rent_end_date: formatDate(row.rent_end_date),
      total_price: Number(row.total_price),
      status: row.status,

      vehicle: {
        vehicle_name: row.vehicle_name,
        registration_number: row.registration_number,
        type: row.type,
      },
    })
  );
};

const updateBookingStatus = async (
  bookingId: number,
  userId: number,
  role: string,
  requestedStatus: "cancelled" | "returned"
): Promise<any> => {
  // 1. Load booking + vehicle
  const bookingQuery = `
    SELECT 
      b.*,
      v.availability_status AS vehicle_availability,
      v.id AS vehicle_id
    FROM bookings b
    JOIN vehicles v ON b.vehicle_id = v.id
    WHERE b.id = $1;
  `;

  const result = await pool.query(bookingQuery, [bookingId]);
  const booking = result.rows[0];

  if (!booking) {
    const err: any = new Error("Booking not found");
    err.status = 404;
    throw err;
  }

  if (role === "customer") {
    if (requestedStatus !== "cancelled") {
      const err: any = new Error("Customers can only cancel bookings");
      err.status = 403;
      throw err;
    }

    if (booking.customer_id !== userId) {
      const err: any = new Error("You are not allowed to modify this booking");
      err.status = 403;
      throw err;
    }

    if (booking.status !== "active") {
      const err: any = new Error("Only active bookings can be cancelled");
      err.status = 400;
      throw err;
    }

    const now = new Date();
    const startDate = new Date(booking.rent_start_date);

    if (now >= startDate) {
      const err: any = new Error(
        "You can only cancel before the booking start date"
      );
      err.status = 400;
      throw err;
    }

    // Update booking status to cancelled
    const cancelResult = await pool.query(
      `UPDATE bookings SET status = 'cancelled' WHERE id = $1 RETURNING *;`,
      [bookingId]
    );
    const updated = cancelResult.rows[0];

    // Make vehicle available again
    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1;`,
      [booking.vehicle_id]
    );

    return {
      id: updated.id,
      customer_id: updated.customer_id,
      vehicle_id: updated.vehicle_id,
      rent_start_date: formatDate(updated.rent_start_date),
      rent_end_date: formatDate(updated.rent_end_date),
      total_price: Number(updated.total_price),
      status: updated.status,
    };
  }

  if (role === "admin") {
    if (requestedStatus !== "returned") {
      const err: any = new Error("Admins can only mark bookings as returned");
      err.status = 403;
      throw err;
    }

    if (booking.status === "returned") {
      const err: any = new Error("Booking is already marked as returned");
      err.status = 400;
      throw err;
    }

    const returnResult = await pool.query(
      `UPDATE bookings SET status = 'returned' WHERE id = $1 RETURNING *;`,
      [bookingId]
    );
    const updated = returnResult.rows[0];

    await pool.query(
      `UPDATE vehicles SET availability_status = 'available' WHERE id = $1;`,
      [booking.vehicle_id]
    );

    return {
      id: updated.id,
      customer_id: updated.customer_id,
      vehicle_id: updated.vehicle_id,
      rent_start_date: formatDate(updated.rent_start_date),
      rent_end_date: formatDate(updated.rent_end_date),
      total_price: Number(updated.total_price),
      status: updated.status,
      vehicle: {
        availability_status: "available",
      },
    };
  }

  const err: any = new Error("Unauthorized role");
  err.status = 403;
  throw err;
};

export const bookingService = {
  createBooking,
  getAllBookings,
  updateBookingStatus,
};
