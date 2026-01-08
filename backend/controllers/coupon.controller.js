import asyncHandler from "../middleware/asyncHandler";
import Coupon from "../models/coupon.model";
import Order from "../models/order.model";

// @desc    Check coupon
// @route   POST /api/coupon/check
// @access  Public
const checkCoupon = asyncHandler (async (req, res) => {
    const { coupon_code, subtotal } = req.body;
    
    const coupon = await Coupon.findOne({
        code: coupon_code,
        is_active: true,
        start_date: { $lte: Date.now() },
        end_date: { $gte: Date.now() },
    });

    if (!coupon) {
        res.status(404);
        throw new Error("คูปองไม่ถูกต้องหรือหมดอายุ");
    }

    const userUsedCount = await Order.countDocuments({
        user_id: req.user._id,
        "coupon_info.coupon_code": coupon_code,
        status: { $ne: "cancelled" }
    });

    if (userUsedCount >= 1) {
        res.status(400);
        throw new Error("คูปองนี้เคยใช้ไปแล้ว");
    }

    if(coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
        res.status(400);
        throw new Error("คูปองนี้ถูกใช้จนครบจำนวนแล้ว");
    }

    if (coupon.min_order_value && subtotal < coupon.min_order_value) {
        res.status(400);
        throw new Error(`ยอดสั่งซื้อไม่ถึงขั้นต่ำ (${coupon.min_order_value} บาท)`);
    }

    let discount = 0;
    if (coupon.discount_type === 'percentage') {
        discount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
            discount = coupon.max_discount_amount;
        }
    }else if (coupon.discount_type === 'fixed') {
        discount = coupon.discount_value;
    }

    res.json({
        valid: true,
        discount: discount,
        coupon_code: coupon.code,
        coupon_id: coupon._id
    });
});

const createCoupon = await asyncHandler(async (req, res) => {
    const { code, discount_type, discount_value, max_discount_amount, usage_limit, min_order_value, start_date, end_date } = req.body;

    const couponExists = await Coupon.findOne({ code })
    if (couponExists) {
        res.status(400);
        throw new Error("Code คูปองนี้มีอยู่แล้ว")
    }

    const coupon = await Coupon.create({
        code: code.toUpperCase(),
        
    })


})