"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyToken = exports.verifyTokens = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyUserRole = (token) => {
    if (!token) {
        return { valid: false, role: null };
    }
    const JWT_SECRET = process.env.SUPABASE_JWT_SECRET;
    if (!JWT_SECRET)
        throw new Error("Missing SUPABASE_JWT_SECRET");
    try {
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        const role = decoded.role || null;
        if (role === "admin" || role === "agent" || role === "user") {
            return { valid: true, role };
        }
        return { valid: false, role: null };
    }
    catch (error) {
        console.error("JWT verification failed:", error);
        return { valid: false, role: null };
    }
};
const verifyTokens = (req, res, next) => {
    var _a;
    const bearer = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    if (!bearer || !bearer.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
    }
    const token = bearer.split(" ")[1];
    const { valid } = verifyUserRole(token);
    if (!valid) {
        res.status(401).json({ message: "Unauthorized" });
        return;
    }
    try {
        const { valid, role } = verifyUserRole(token);
        if (!valid || !role) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.user = { role };
        next();
    }
    catch (err) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
};
exports.verifyTokens = verifyTokens;
const verifyToken = (req, res, next) => {
    var _a;
    const bearer = (_a = req.headers) === null || _a === void 0 ? void 0 : _a.authorization;
    if (!bearer || !bearer.startsWith("Bearer ")) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    const token = bearer.split(" ")[1];
    try {
        const { valid, role } = verifyUserRole(token);
        const allowedRoles = ["admin", "agent", "user"];
        if (!valid || !role || !allowedRoles.includes(role)) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        req.user = { role };
        next();
    }
    catch (err) {
        res.status(403).json({ error: "Forbidden" });
        return;
    }
};
exports.verifyToken = verifyToken;
