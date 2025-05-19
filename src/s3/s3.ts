import AWS from "aws-sdk";
import dotenv from "dotenv";
import { Request, Response } from "express";

dotenv.config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  signatureVersion: "v4",
});

const generateUploadURL = async (
  filename: string,
  contentType: string
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${filename}`,
    Expires: 60 * 60,
    ContentType: contentType,
  };

  return await s3.getSignedUrlPromise("putObject", params);
};

export const generateSignedURL = async (req: Request, res: Response) => {
  const { filename, contentType } = req.query;

  if (typeof filename !== "string" || typeof contentType !== "string") {
    res.status(400).json({ error: "Invalid query parameters" });
    return;
  }

  try {
    const url = await generateUploadURL(filename, contentType);
    res.status(200).send({ url });
    return;
  } catch (err) {
    console.error("Error generating signed URL:", err);
    res.status(500).send({ error: "Failed to generate URL" });
    return;
  }
};
