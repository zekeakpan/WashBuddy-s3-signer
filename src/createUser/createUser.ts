import { Request, Response } from "express";
import { supabase } from "../config/supabase";

export const createUser = async (userData: AgentData) => {
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.phoneNumber,
      user_metadata: { role: userData.role, phone: userData.phoneNumber },
      email_confirm: true,
    });

    if (error) {
      return { error: error };
    }

    const { error: agentCreationError } = await supabase.from("agents").insert({
      id: data?.user?.id,
      full_name: userData.name,
      email: userData.email,
      phone_number: userData.phoneNumber,
      address: userData.address,
      date_of_birth: userData.dateOfBirth,
      role: userData.role,
      profile_picture_url: userData.imagePubId,
    });

    if (agentCreationError) {
      return { data: null, error: agentCreationError };
    }

    return { data };
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

  const userData = req.body;
  try {
    const { data, error } = await createUser(userData);
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
