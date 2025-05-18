import { createClient } from "@supabase/supabase-js";
import jwt from "jsonwebtoken";

const supabase = createClient(
  process.env.SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

export const verifyUserRole = (
  token: string | null
): { valid: boolean; role: string | null } => {
  if (!token) {
    return { valid: false, role: null };
  }
  const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;

  if (!JWT_SECRET) throw new Error("Missing SUPABASE_JWT_SECRET");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const role = (decoded as { role: string }).role || null;
    if (role === "admin" || role === "agent") {
      return { valid: true, role };
    }
    return { valid: false, role: null };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { valid: false, role: null };
  }
};

export const createUser = async (
  email: string,
  phoneNumber: string,
  role: string | null = null
) => {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: email,
      password: phoneNumber,
      user_metadata: { role: role, phone: phoneNumber },
      email_confirm: true,
    });

    return { data, error };
  } catch (error) {
    console.error(error);
    return { data: null, error: error };
  }
};
