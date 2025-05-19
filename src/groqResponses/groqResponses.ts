import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

const getGroqResponses = async (prompt: string) => {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    throw new Error("GROK_API_KEY is not set");
  }
  try {
    const res = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content:
              "You are a helpful assistant for WashBuddy, be professional and concise.",
          },
          { role: "user", content: prompt },
        ],
        temperature: 0.7,
      }),
    });

    const data = await res.json();
    console.log("groq response", data);
    return (
      data.choices?.[0]?.message?.content ??
      "Will connect you to a human agent right away."
    );
  } catch (error) {
    console.error(error);
    return "Will connect you to a human agent right away.";
  }
};

export const getGroqResponse = async (req: Request, res: Response) => {
  const { prompt } = req.body;

  if (!prompt) {
    res.status(400).json({ error: "Prompt is required" });
    return;
  }

  try {
    const response = await getGroqResponses(prompt);
    res.json({ response });
    return;
  } catch (error) {
    res.status(500).json({ error: "Failed to get Groq response" });
    return;
  }
};
