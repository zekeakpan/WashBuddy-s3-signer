type BookingQueue = {
  user_id: UUID;
  plan_id: UUID;
  reserved_date: string;
  is_monthly: boolean;
  subscription_id?: string | null;
};

type BookedPlan = {
  id: UUID;
  isMonthly: boolean;
};

type BookingRequest = {
  bookedPlans: BookedPlan[];
  reservedDate: string;
  customerId: string;
};
