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
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const createUser_1 = require("./createUser");
const genBlurhash_1 = require("./genBlurhash");
const groqResponses_1 = require("./groqResponses");
const s3_1 = __importDefault(require("./s3"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
app.use(express_1.default.json());
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
}));
app.get("/generate-url", ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        return res.status(401).json({ error: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
    const { filename, contentType } = req.query;
    if (typeof filename !== "string" || typeof contentType !== "string") {
        return res.status(400).json({ error: "Invalid query parameters" });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SUPABASE_JWT_SECRET);
        console.log("🔑 Decoded token:", decoded);
        const url = yield (0, s3_1.default)(filename, contentType);
        res.send({ url });
    }
    catch (err) {
        console.error("Error generating signed URL:", err);
        res.status(500).send({ error: "Failed to generate URL" });
    }
})));
app.post("/generate-blurhash", ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageUrl } = req.body;
    console.log("🌀 Received request to generate blurhash");
    console.log("Image URL:", imageUrl);
    if (!imageUrl || typeof imageUrl !== "string") {
        res.status(400).json({ error: "Invalid or missing imageUrl" });
        return;
    }
    try {
        const blurhash = yield (0, genBlurhash_1.generateBlurhashFromS3Image)(imageUrl);
        console.log("✅ Blurhash generated:", blurhash);
        return res.json({ blurhash });
    }
    catch (error) {
        console.error("❌ Failed to generate blurhash:", error);
        res.status(500).json({ error: "Could not generate blurhash" });
    }
})));
app.post("/create-user", ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        return res.status(401).json({ error: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
    const { valid } = (0, createUser_1.verifyUserRole)(token);
    if (!valid) {
        return res.status(401).json({ error: "Access denied.  Unauthorized role" });
    }
    const { email, phoneNumber, role: userRole } = req.body;
    try {
        const { data, error } = yield (0, createUser_1.createUser)(email, phoneNumber, userRole);
        if (error) {
            res.status(500).json({ error: "Failed to create user" });
        }
        else {
            res.json({ userId: (_a = data === null || data === void 0 ? void 0 : data.user) === null || _a === void 0 ? void 0 : _a.id });
        }
    }
    catch (error) {
        res.status(500).json({ error: "Failed to create user" });
    }
})));
app.post("/get-groq-response", ((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    const authHeader = req.headers.authorization;
    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith("Bearer "))) {
        return res.status(401).json({ error: "Missing or invalid token" });
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.SUPABASE_JWT_SECRET);
        console.log("🔑 Decoded token:", decoded);
        if (!decoded) {
            return res.status(401).json({ error: "Invalid token" });
        }
        const response = yield (0, groqResponses_1.getGroqResponses)(prompt);
        res.json({ response });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get Groq response" });
    }
})));
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("🚀 Server running on port 4000"));
