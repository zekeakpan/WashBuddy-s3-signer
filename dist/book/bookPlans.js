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
exports.bookPlans = void 0;
const supabase_1 = require("../config/supabase");
const bookHelpers_1 = require("./bookHelpers");
const bookPlans = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { customerId, bookedPlans, reservedDate } = req.body;
    // check if customer exists
    const { data: customer, error } = yield supabase_1.supabase
        .from("users")
        .select("*")
        .eq("id", customerId);
    if (error) {
        res.status(400).json({ error: error.message });
        return;
    }
    if (!customer) {
        res.status(400).json({ error: "Customer not found" });
        return;
    }
    try {
        yield Promise.all(bookedPlans.map((plan) => __awaiter(void 0, void 0, void 0, function* () {
            var _a;
            const job = {
                user_id: customerId,
                plan_id: plan.id,
                reserved_date: reservedDate,
                is_monthly: (_a = plan.isMonthly) !== null && _a !== void 0 ? _a : false,
            };
            const result = yield (0, bookHelpers_1.runFullBookingJob)(job);
            if (!result.success) {
                console.error("One or more bookings failed.");
            }
        })));
        res.status(200).json({ message: "Bookings created successfully" });
        return;
    }
    catch (error) {
        console.error("Error booking plans:", error);
        res.status(500).json({ error: "Internal server error" });
        return;
    }
});
exports.bookPlans = bookPlans;
