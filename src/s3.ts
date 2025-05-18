import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

const s3 = new AWS.S3({
  region: process.env.AWS_REGION || "us-east-1",
  accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  signatureVersion: "v4",
});

const generateUploadURL = async (
  filename: string,
  contentType: string,
): Promise<string> => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `uploads/${filename}`,
    Expires: 60 * 60,
    ContentType: contentType,
  };

  return await s3.getSignedUrlPromise("putObject", params);
};

export default generateUploadURL;
