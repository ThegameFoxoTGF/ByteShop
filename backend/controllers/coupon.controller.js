import asyncHandler from "../middleware/asyncHandler.js";
import Coupon from "../models/coupon.model.js";
import Order from "../models/order.model.js";

// @desc    Check coupon
// @route   POST /api/coupon/check
// @access  Public
const checkCoupon = asyncHandler(async (req, res) => {
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
    status: { $ne: "cancelled" },
  });

  if (userUsedCount >= 1) {
    res.status(400);
    throw new Error("คูปองนี้เคยใช้ไปแล้ว");
  }

  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
    res.status(400);
    throw new Error("คูปองนี้ถูกใช้จนครบจำนวนแล้ว");
  }

  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    res.status(400);
    throw new Error(`ยอดสั่งซื้อไม่ถึงขั้นต่ำ (${coupon.min_order_value} บาท)`);
  }

  let discount = 0;
  if (coupon.discount_type === "percentage") {
    discount = (subtotal * coupon.discount_value) / 100;
    if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
      discount = coupon.max_discount_amount;
    }
  } else if (coupon.discount_type === "fixed") {
    discount = coupon.discount_value;
  }

  res.json({
    valid: true,
    discount: discount,
    coupon_code: coupon.code,
    coupon_id: coupon._id,
  });
});

// @desc    Create coupon
// @route   POST /api/coupon
// @access  Private/Admin
const createCoupon = await asyncHandler(async (req, res) => {
  const {
    code,
    discount_type,
    discount_value,
    max_discount_amount,
    usage_limit,
    min_order_value,
    start_date,
    end_date,
  } = req.body;

  const couponExists = await Coupon.findOne({ code });
  if (couponExists) {
    res.status(400);
    throw new Error("Code คูปองนี้มีอยู่แล้ว");
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase(),
    description,
    discount_type,
    discount_value,
    max_discount_amount,
    min_order_value,
    usage_limit,
    used_count: 0,
    start_date,
    end_date,
    is_active: true,
  });

  res.status(201).json(coupon);
});

// @desc    Get All coupon
// @route   Get /api/coupon
// @access  Private/Admin
const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find({}).sort({ createdAt: -1 });
  res.json(coupons);
});

// @desc    Get coupon by ID
// @route   Get /api/coupon/:id
// @access  Private/Admin
const getCouponById = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (coupon) {
    res.json(coupon);
  } else {
    res.status(404);
    throw new Error("ไม่พบคูปอง");
  }
});

// @desc    Update coupon
// @route   PUT /api/coupon/:id
// @access  Private/Admin
const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    coupon.code = req.body.code ? req.body.code.toUpperCase() : coupon.code;
    coupon.description = req.body.description || coupon.description;
    coupon.discount_type = req.body.discount_type || coupon.discount_type;
    coupon.discount_value =
      req.body.discount_value !== undefined
        ? req.body.discount_value
        : coupon.discount_value;
    coupon.min_order_value =
      req.body.min_order_value !== undefined
        ? req.body.min_order_value
        : coupon.min_order_value;
    coupon.max_discount_amount =
      req.body.max_discount_amount !== undefined
        ? req.body.max_discount_amount
        : coupon.max_discount_amount;
    coupon.usage_limit =
      req.body.usage_limit !== undefined
        ? req.body.usage_limit
        : coupon.usage_limit;
    coupon.usagePerUser =
      req.body.usagePerUser !== undefined
        ? req.body.usagePerUser
        : coupon.usagePerUser;
    coupon.start_date = req.body.start_date || coupon.start_date;
    coupon.end_date = req.body.end_date || coupon.end_date;
    coupon.is_active =
      req.body.is_active !== undefined ? req.body.is_active : coupon.is_active;

    const updatedCoupon = await coupon.save();
    res.json(updatedCoupon);
  } else {
    res.status(404);
    throw new Error("ไม่พบคูปอง");
  }
});

// @desc    Delete coupon
// @route   DELETE /api/coupon/:id
// @access  Private/Admin
const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (coupon) {
    await coupon.deleteOne({ _id: coupon._id });
    res.json({ message: "คูปองถูกลบเรียบร้อย" });
  } else {
    res.status(404);
    throw new Error("ไม่พบคูปอง");
  }
});

export {
  checkCoupon,
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
};
