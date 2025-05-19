import { Request, Response } from "express";
import { supabase } from "../config/supabase";

const addUserToSupabase = async (savedUser: User) => {
  if (!savedUser) return false;

  try {
    const { error } = await supabase.from("users").upsert({
      id: savedUser.id,
      email: savedUser.email,
      full_name: savedUser.full_name,
      profile_picture_url: savedUser.profile_picture_url,
      created_at: savedUser.created_at,
      updated_at: savedUser.updated_at,
      provider: savedUser.provider ?? null,
    });

    if (error) return false;
    return true;
  } catch (error) {
    console.error(error);
    return false;
  }
};

export const saveUserToSupabase = async (req: Request, res: Response) => {
  if (!req.body) {
    res.status(400).json({ error: "No body provided" });
    return;
  }

  try {
    // Save to DB or handle accordingly
    const savedUser = await addUserToSupabase(req.body);
    if (!savedUser) {
      res.status(500).json({ error: "Failed to save user" });
      return;
    }
    res.status(200).json({ message: "User saved successfully" });
    return;
  } catch (err) {
    res.status(500).json({ error: "Server error" });
    return;
  }
};
