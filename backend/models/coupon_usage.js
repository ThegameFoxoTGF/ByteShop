import mongoose from "mongoose";

const CouponUsageSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User",},
    coupon: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon",},
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    used_at: Date
},{timestamps: true})

const CouponUsage = mongoose.model("CouponUsage", CouponUsageSchema);

export default CouponUsage;