"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateSignedURL = void 0;
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const s3 = new aws_sdk_1.default.S3({
    region: process.env.AWS_REGION || "us-east-1",
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    signatureVersion: "v4",
});
const generateUploadURL = (filename, contentType) => __awaiter(void 0, void 0, void 0, function* () {
    const params = {
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: `uploads/${filename}`,
        Expires: 60 * 60,
        ContentType: contentType,
    };
    return yield s3.getSignedUrlPromise("putObject", params);
});
const generateSignedURL = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { filename, contentType } = req.query;
    if (typeof filename !== "string" || typeof contentType !== "string") {
        res.status(400).json({ error: "Invalid query parameters" });
        return;
    }
    try {
        const url = yield generateUploadURL(filename, contentType);
        res.status(200).send({ url });
        return;
    }
    catch (err) {
        console.error("Error generating signed URL:", err);
        res.status(500).send({ error: "Failed to generate URL" });
        return;
    }
});
exports.generateSignedURL = generateSignedURL;
