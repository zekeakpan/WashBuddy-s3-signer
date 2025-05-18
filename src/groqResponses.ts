import dotenv from "dotenv";

dotenv.config();

export const getGroqResponses = async (prompt: string) => {
  const GROK_API_KEY = process.env.GROK_API_KEY;
  if (!GROK_API_KEY) {
    throw new Error("GROK_API_KEY is not set");
  }
  try {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROK_API_KEY}`,
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
    return (
      data.choices?.[0]?.message?.content ??
      "Will connect you to a human agent right away."
    );
  } catch (error) {
    console.error(error);
    return "Will connect you to a human agent right away.";
  }
};
