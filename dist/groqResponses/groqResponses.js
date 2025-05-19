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
exports.getGroqResponse = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const getGroqResponses = (prompt) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    const GROQ_API_KEY = process.env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
        throw new Error("GROK_API_KEY is not set");
    }
    try {
        const res = yield fetch(GROQ_URL, {
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
                        content: "You are a helpful assistant for WashBuddy, be professional and concise.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
            }),
        });
        const data = yield res.json();
        console.log("groq response", data);
        return ((_d = (_c = (_b = (_a = data.choices) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content) !== null && _d !== void 0 ? _d : "Will connect you to a human agent right away.");
    }
    catch (error) {
        console.error(error);
        return "Will connect you to a human agent right away.";
    }
});
const getGroqResponse = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt } = req.body;
    if (!prompt) {
        res.status(400).json({ error: "Prompt is required" });
        return;
    }
    try {
        const response = yield getGroqResponses(prompt);
        res.json({ response });
        return;
    }
    catch (error) {
        res.status(500).json({ error: "Failed to get Groq response" });
        return;
    }
});
exports.getGroqResponse = getGroqResponse;
