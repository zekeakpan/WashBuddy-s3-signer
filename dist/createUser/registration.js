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
exports.saveUserToSupabase = void 0;
const supabase_1 = require("../config/supabase");
const addUserToSupabase = (savedUser) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    if (!savedUser)
        return false;
    try {
        const { error } = yield supabase_1.supabase.from("users").upsert({
            id: savedUser.id,
            email: savedUser.email,
            full_name: savedUser.full_name,
            profile_picture_url: savedUser.profile_picture_url,
            created_at: savedUser.created_at,
            updated_at: savedUser.updated_at,
            provider: (_a = savedUser.provider) !== null && _a !== void 0 ? _a : null,
        });
        if (error)
            return false;
        return true;
    }
    catch (error) {
        console.error(error);
        return false;
    }
});
const saveUserToSupabase = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.body) {
        res.status(400).json({ error: "No body provided" });
        return;
    }
    try {
        // Save to DB or handle accordingly
        const savedUser = yield addUserToSupabase(req.body);
        if (!savedUser) {
            res.status(500).json({ error: "Failed to save user" });
            return;
        }
        res.status(200).json({ message: "User saved successfully" });
        return;
    }
    catch (err) {
        res.status(500).json({ error: "Server error" });
        return;
    }
});
exports.saveUserToSupabase = saveUserToSupabase;
