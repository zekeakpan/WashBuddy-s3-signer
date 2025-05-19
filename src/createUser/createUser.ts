import { Request, Response } from "express";
import { supabase } from "../config/supabase";
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

export const createUserOnSupabase = async (req: Request, res: Response) => {
  const allowedRoles = ["admin", "agent"];

  if (!allowedRoles.includes(req.user?.role as string)) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!req.body) {
    res.status(400).json({ error: "No body provided" });
    return;
  }

  const { email, phoneNumber, role } = req.body;
  try {
    const { data, error } = await createUser(email, phoneNumber, role);
    if (error) {
      res.status(500).json({ error: error });
      return;
    }

    res.status(200).json({ userId: data?.user?.id });
    return;
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
    return;
  }
};
