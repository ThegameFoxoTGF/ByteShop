import mongoose from "mongoose";

const CouponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    description: { type: String },
    discount_type: { type: String, required: true },
    discount_value: { type: Number, required: true },
    max_discount_amount: { type: Number },
    min_order_value: { type: Number },
    usage_limit: { type: Number },
    usagePeruser: { type: Number },
    used_count: { type: Number, default: 0 },
    applicable_categories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    start_date: { type: Date },
    end_date: { type: Date },
    is_active: { type: Boolean, default: true }
},{
    timestamps: true,
    versionKey: false
})

const Coupon = mongoose.model("Coupon", CouponSchema);

export default Coupon;
