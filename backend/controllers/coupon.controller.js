import Coupon from "../models/coupon.js";

const createCoupon = async (req, res) => {
    try {
        const coupon = await Coupon.create(req.body);
        res.status(201).json(coupon);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllCoupons = async (req, res) => {
    try {
        const coupons = await Coupon.find();
        res.status(200).json(coupons);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const verifyCoupon = async (req, res) => {
    // Basic verification logic defined in previous implementation, recreating simple one
    try {
        const { code } = req.body;
        const coupon = await Coupon.findOne({ code, is_active: true });
        if (!coupon) return res.status(404).json({ message: "Invalid coupon" });
        // Check date etc...
        res.status(200).json(coupon);
    } catch (error) {
         res.status(500).json({ error: error.message });
    }
}

export { createCoupon, getAllCoupons, verifyCoupon };
