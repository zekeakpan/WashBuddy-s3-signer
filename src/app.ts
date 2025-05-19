import cors from "cors";
import express from "express";
import { verifyToken } from "./middleware/auth";
import userRoutes from "./routes/userRoutes";

const app = express();
app.use(cors());

app.use(express.json());
app.use("/api/users", verifyToken, userRoutes);

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

export default app;
