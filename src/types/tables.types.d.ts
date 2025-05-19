type UUID = string;

type User = {
  id: UUID;
  email: string;
  full_name: string;
  profile_picture_url: string;
  created_at: string;
  updated_at: string;
  provider: string;
  spent?: number;
  planCount?: number;
  amountTransacted?: number;
  is_active: number;
  synced_at: string | null;
};

type Admin = {
  id: number;
  user_id: UUID;
  username: string;
  full_name: string;
  email: string;
  phone_number: string;
  role: "Founder";
  last_login: string;
  status: "Active" | "Inactive" | "Suspended";
  profile_picture_url: string;
  created_at: string;
  updated_at: string;
  synced_at: string | null;
};

type Agent = {
  id: UUID;
  full_name: string;
  email: string;
  phone_number: string;
  address: string;
  date_of_birth: string;
  hire_date: string;
  status: string;
  last_seen: string;
  total_orders: number;
  successful_orders: number;
  failed_orders: number;
  rating: number;
  comments: string;
  profile_picture_url: string;
  created_at: string;
  updated_at: string;
  role: "Manager" | "Agent" | "Support" | "Marketer" | "Laundry Worker";
  team: string;
  query: number;
  synced_at: string | null;
};
