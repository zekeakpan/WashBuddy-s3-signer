import express from "express";
import { bookPlans } from "../book/bookPlans";
import { createUserOnSupabase } from "../createUser/createUser";
import { saveUserToSupabase } from "../createUser/registration";
import { generateBlurhashFromLocalImage } from "../genBlurhash/genBlurhash";
import { getGroqResponse } from "../groqResponses/groqResponses";
import { generateSignedURL } from "../s3/s3";

const router = express.Router();

router.get("/generate-url", generateSignedURL);
router.post("/book-plans", bookPlans);
router.post("/generate-blurhash", generateBlurhashFromLocalImage);
router.post("/create-user", createUserOnSupabase);
router.post("/add-user", saveUserToSupabase);
router.post("/get-groq-response", getGroqResponse);

export default router;
