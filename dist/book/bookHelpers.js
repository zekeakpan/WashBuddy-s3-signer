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
exports.runFullBookingJob = void 0;
const uuid_1 = require("uuid");
const supabase_1 = require("../config/supabase");
const createSubscription = (job) => __awaiter(void 0, void 0, void 0, function* () {
    const subId = (0, uuid_1.v4)();
    yield supabase_1.supabase.from("subscriptions").insert({
        id: subId,
        user_id: job.user_id,
        plan_id: job.plan_id,
        orders_left: !!job.is_monthly ? 4 : 1,
        is_monthly: !!job.is_monthly,
    });
    return subId;
});
const createOrdersRemote = (job) => __awaiter(void 0, void 0, void 0, function* () {
    const { data: orders, error } = yield supabase_1.supabase.rpc("schedule_subscription_orders", {
        p_user_id: job.user_id,
        p_subscription_id: job.subscription_id,
        p_reserved_date: job.reserved_date,
    });
    if (error || !(orders === null || orders === void 0 ? void 0 : orders.length)) {
        throw new Error((error === null || error === void 0 ? void 0 : error.message) || "No orders returned from Supabase");
    }
    return orders;
});
const runFullBookingJob = (job) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const subscriptionId = yield createSubscription(job);
        const updatedJob = Object.assign(Object.assign({}, job), { subscription_id: subscriptionId });
        yield createOrdersRemote(updatedJob);
        return { success: true };
    }
    catch (err) {
        console.error("Booking Job Failed:", err);
        return { success: false };
    }
});
exports.runFullBookingJob = runFullBookingJob;
