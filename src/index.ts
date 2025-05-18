import cors from "cors";
import dotenv from "dotenv";
import express, { Request, RequestHandler, Response } from "express";
import jwt from "jsonwebtoken";
import { createUser, verifyUserRole } from "./createUser";
import { generateBlurhashFromS3Image } from "./genBlurhash";
import { getGroqResponses } from "./groqResponses";
import generateUploadURL from "./s3";

dotenv.config();

const app = express();
app.use(cors());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.get("/generate-url", (async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  const { filename, contentType } = req.query;

  if (typeof filename !== "string" || typeof contentType !== "string") {
    return res.status(400).json({ error: "Invalid query parameters" });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET as string
    );
    console.log("🔑 Decoded token:", decoded);

    const url = await generateUploadURL(filename, contentType);
    res.send({ url });
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).send({ error: "Failed to generate URL" });
  }
}) as RequestHandler);

app.post("/generate-blurhash", (async (req: Request, res: Response) => {
  const { imageUrl } = req.body;

  console.log("🌀 Received request to generate blurhash");
  console.log("Image URL:", imageUrl);

  if (!imageUrl || typeof imageUrl !== "string") {
    res.status(400).json({ error: "Invalid or missing imageUrl" });
    return;
  }

  try {
    const blurhash = await generateBlurhashFromS3Image(imageUrl);
    console.log("✅ Blurhash generated:", blurhash);
    return res.json({ blurhash });
  } catch (error) {
    console.error("❌ Failed to generate blurhash:", error);
    res.status(500).json({ error: "Could not generate blurhash" });
  }
}) as RequestHandler);

app.post("/create-user", (async (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];
  const { valid } = verifyUserRole(token);

  if (!valid) {
    return res.status(401).json({ error: "Access denied.  Unauthorized role" });
  }

  const { email, phoneNumber, role: userRole } = req.body;
  try {
    const { data, error } = await createUser(email, phoneNumber, userRole);
    if (error) {
      res.status(500).json({ error: "Failed to create user" });
    } else {
      res.json({ userId: data?.user?.id });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to create user" });
  }
}) as RequestHandler);

app.post("/get-groq-response", (async (req: Request, res: Response) => {
  const { prompt } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing or invalid token" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.SUPABASE_JWT_SECRET as string
    );
    console.log("🔑 Decoded token:", decoded);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const response = await getGroqResponses(prompt);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ error: "Failed to get Groq response" });
  }
}) as RequestHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("🚀 Server running on port 4000"));
