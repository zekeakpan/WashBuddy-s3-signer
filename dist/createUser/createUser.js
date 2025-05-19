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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createUserOnSupabase = exports.createUser = void 0;
const supabase_1 = require("../config/supabase");
const createUser = (email_1, phoneNumber_1, ...args_1) => __awaiter(void 0, [email_1, phoneNumber_1, ...args_1], void 0, function* (email, phoneNumber, role = null) {
    try {
        const { data, error } = yield supabase_1.supabase.auth.admin.createUser({
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
const createUserOnSupabase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const allowedRoles = ["admin", "agent"];
    if (!allowedRoles.includes((_a = req.user) === null || _a === void 0 ? void 0 : _a.role)) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }
    if (!req.body) {
        res.status(400).json({ error: "No body provided" });
        return;
    }
    const { email, phoneNumber, role } = req.body;
    try {
        const { data, error } = yield (0, exports.createUser)(email, phoneNumber, role);
        if (error) {
            res.status(500).json({ error: error });
            return;
        }
        res.status(200).json({ userId: (_b = data === null || data === void 0 ? void 0 : data.user) === null || _b === void 0 ? void 0 : _b.id });
        return;
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
        return;
    }
});
exports.createUserOnSupabase = createUserOnSupabase;
