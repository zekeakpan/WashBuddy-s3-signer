import { Request, Response } from "express";
import { supabase } from "../config/supabase";
import { runFullBookingJob } from "./bookHelpers";

export const bookPlans = async (req: Request, res: Response) => {
  const { customerId, bookedPlans, reservedDate } = req.body as BookingRequest;

  // check if customer exists
  const { data: customer, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", customerId);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }

  if (!customer) {
    res.status(400).json({ error: "Customer not found" });
    return;
  }

  try {
    await Promise.all(
      bookedPlans.map(async (plan) => {
        const job: any = {
          user_id: customerId,
          plan_id: plan.id,
          reserved_date: reservedDate,
          is_monthly: plan.isMonthly ?? false,
        };

        const result = await runFullBookingJob(job);
        if (!result.success) {
          console.error("One or more bookings failed.");
        }
      })
    );

    res.status(200).json({ message: "Bookings created successfully" });
    return;
  } catch (error) {
    console.error("Error booking plans:", error);
    res.status(500).json({ error: "Internal server error" });
    return;
  }
};
