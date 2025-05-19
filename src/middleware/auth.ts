import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const verifyUserRole = (
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
    if (role === "admin" || role === "agent" || role === "user") {
      return { valid: true, role };
    }
    return { valid: false, role: null };
  } catch (error) {
    console.error("JWT verification failed:", error);
    return { valid: false, role: null };
  }
};

export const verifyTokens = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const bearer = req.headers?.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const token = bearer.split(" ")[1];

  const { valid } = verifyUserRole(token);
  if (!valid) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
  try {
    const { valid, role } = verifyUserRole(token);
    if (!valid || !role) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    req.user = { role };
    next();
  } catch (err) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
};

export const verifyToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const bearer = req.headers?.authorization;

  if (!bearer || !bearer.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const token = bearer.split(" ")[1];

  try {
    const { valid, role } = verifyUserRole(token);
    const allowedRoles = ["admin", "agent", "user"];
    if (!valid || !role || !allowedRoles.includes(role)) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    req.user = { role };
    next();
  } catch (err) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
};
