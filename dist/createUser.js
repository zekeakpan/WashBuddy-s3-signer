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
exports.createUser = exports.verifyUserRole = void 0;
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const supabase = (0, supabase_js_1.createClient)(process.env.SUPABASE_PROJECT_URL || "", process.env.SUPABASE_SERVICE_ROLE_KEY || "");
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
        if (role === "admin" || role === "agent") {
            return { valid: true, role };
        }
        return { valid: false, role: null };
    }
    catch (error) {
        console.error("JWT verification failed:", error);
        return { valid: false, role: null };
    }
};
exports.verifyUserRole = verifyUserRole;
const createUser = (email_1, phoneNumber_1, ...args_1) => __awaiter(void 0, [email_1, phoneNumber_1, ...args_1], void 0, function* (email, phoneNumber, role = null) {
    try {
        const { data, error } = yield supabase.auth.admin.createUser({
            email: email,
            password: phoneNumber,
            user_metadata: { role: role, phone: phoneNumber },
            email_confirm: true,
        });
        return { data, error };
    }
    catch (error) {
        console.error(error);
        return { data: null, error: error };
    }
});
exports.createUser = createUser;
