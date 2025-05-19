import { v4 as uuidv4 } from "uuid";
import { supabase } from "../config/supabase";

const createSubscription = async (job: BookingQueue) => {
  const subId = uuidv4();

  await supabase.from("subscriptions").insert({
    id: subId,
    user_id: job.user_id,
    plan_id: job.plan_id,
    orders_left: !!job.is_monthly ? 4 : 1,
    is_monthly: !!job.is_monthly,
  });

  return subId;
};

const createOrdersRemote = async (job: BookingQueue) => {
  const { data: orders, error } = await supabase.rpc(
    "schedule_subscription_orders",
    {
      p_user_id: job.user_id,
      p_subscription_id: job.subscription_id,
      p_reserved_date: job.reserved_date,
    }
  );

  if (error || !orders?.length) {
    throw new Error(error?.message || "No orders returned from Supabase");
  }

  return orders;
};

export const runFullBookingJob = async (job: BookingQueue) => {
  try {
    const subscriptionId = await createSubscription(job);

    const updatedJob = { ...job, subscription_id: subscriptionId };

    await createOrdersRemote(updatedJob);

    return { success: true };
  } catch (err) {
    console.error("Booking Job Failed:", err);
    return { success: false };
  }
};
