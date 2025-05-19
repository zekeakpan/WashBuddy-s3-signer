import axios from "axios";
import { encode } from "blurhash";
import { Request, Response } from "express";
import sharp from "sharp";

const generateBlurhash = async (imageUrl: string): Promise<string> => {
  const response = await axios.get<ArrayBuffer>(imageUrl, {
    responseType: "arraybuffer",
  });

  const imageBuffer = Buffer.from(response.data);

  const { data, info } = await sharp(imageBuffer, {
    failOnError: false,
    limitInputPixels: false,
  })
    .resize(32, 32, {
      fit: "cover",
      fastShrinkOnLoad: true,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return encode(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
};

export const generateBlurhashFromLocalImage = async (
  req: Request,
  res: Response
) => {
  const { imageUrl } = req.body;

  console.log("🌀 Received request to generate blurhash");

  if (!imageUrl || typeof imageUrl !== "string") {
    res.status(400).json({ error: "Invalid or missing imageUrl" });
    return;
  }

  try {
    const blurhash = await generateBlurhash(imageUrl);
    console.log("✅ Blurhash generated:", blurhash);
    res.status(200).json({ blurhash });
    return;
  } catch (error) {
    console.error("❌ Failed to generate blurhash:", error);
    res.status(500).json({ error: "Could not generate blurhash" });
    return;
  }
};
