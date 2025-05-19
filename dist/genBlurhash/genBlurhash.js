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
exports.generateBlurhashFromLocalImage = void 0;
const axios_1 = __importDefault(require("axios"));
const blurhash_1 = require("blurhash");
const sharp_1 = __importDefault(require("sharp"));
const generateBlurhash = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(imageUrl, {
        responseType: "arraybuffer",
    });
    const imageBuffer = Buffer.from(response.data);
    const { data, info } = yield (0, sharp_1.default)(imageBuffer, {
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
    return (0, blurhash_1.encode)(new Uint8ClampedArray(data), info.width, info.height, 4, 3);
});
const generateBlurhashFromLocalImage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { imageUrl } = req.body;
    console.log("🌀 Received request to generate blurhash");
    if (!imageUrl || typeof imageUrl !== "string") {
        res.status(400).json({ error: "Invalid or missing imageUrl" });
        return;
    }
    try {
        const blurhash = yield generateBlurhash(imageUrl);
        console.log("✅ Blurhash generated:", blurhash);
        res.status(200).json({ blurhash });
        return;
    }
    catch (error) {
        console.error("❌ Failed to generate blurhash:", error);
        res.status(500).json({ error: "Could not generate blurhash" });
        return;
    }
});
exports.generateBlurhashFromLocalImage = generateBlurhashFromLocalImage;
