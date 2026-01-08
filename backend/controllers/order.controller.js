import asyncHandler from "../middleware/asyncHandler.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";

//helper function
const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${timestamp}-${random}`;
}

// @desc    Create new order
// @route   POST /api/order
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
    const user = req.user._id;
    const { shipping_address, payment_method, coupon_code } = req.body;

    const cart = await Cart.findOne({ user }).populate("items.product");
    
    if (!cart || cart.items.length === 0) {
        res.status(404);
        throw new Error("ไม่มีสินค้าในตะกร้า");
    };

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if(!product || item.quantity > product.stock) {
            res.status(400);
            throw new Error(`สินค้า ${product.name} ไม่เพียงพอ`)
        }

        orderItems.push({
            product_id: product._id,
            name: product.name,
            main_image: product.main_image,
            price_snapshot: product.selling_price,
            quantity: item.quantity
        });

        subtotal += product.selling_price * item.quantity;
    }

    let discount = 0;
    let couponInfo = {};

    if (coupon_code) {
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

        if (coupon.discount_type === 'percentage') {
            discount = (subtotal * coupon.discount_value) / 100;
            if (coupon.max_discount_amount && discount > coupon.max_discount_amount) {
                discount = coupon.max_discount_amount;
            }
        }else if (coupon.discount_type === 'fixed') {
            discount = coupon.discount_value;
        }

        couponInfo = {
            coupon_id: coupon._id,
            coupon_code: coupon.code,
            coupon_discount_type: coupon.discount_type,
        };

        await Coupon.findByIdAndUpdate(coupon._id, { $inc: { used_count: 1 } });
    }

    let shipping_fee = subtotal < 5000 ? 50 : 0;
    const total_price = subtotal - discount + shipping_fee;
    const tax_price = total_price * 0.07;
    const subtotal_before_tax = total_price - tax_price;

    const order = await Order.create({
        user_id: req.user._id,
        order_id: generateOrderNumber(),
        items: orderItems,
        status: "pending",
        payment_method,
        shipping_address,
        coupon_info: couponInfo,
        pricing_info: {
            subtotal,
            discount,
            shipping_fee,
            tax_price,
            subtotal_before_tax,
            total_price: total_price < 0 ? 0 : total_price,
        },
    });

    await Cart.findByIdAndDelete(cart._id);

    res.json(order);

});

// @desc    Approve order
// @route   PUT /api/order/:id/approve
// @access  Private
const approveOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    if(order.status !== 'pending') {
        res.status(400);
        throw new Error("ออเดอร์นี้ไม่ได้อยู่ในสถานะรอตรวจสอบ");
    }

    const bulkOps = [];

    for (const item of order.items) {
        const product = await Product.findById(item.product_id);

        if (!product) {
            res.status(400);
            throw new Error(`สินค้า ${item.name} หาไม่เจอในระบบแล้ว`);
        }

        if (product.stock < item.quantity) {
            res.status(400);
            throw new Error(`ยืนยันไม่ได้! สินค้า ${product.name} เหลือไม่พอ (เหลือ ${product.stock})`);
        }

        bulkOps.push({
            updateOne: {
                filter: { _id: product._id },
                update: { $inc: { stock: -item.quantity } }
            }
        });
    }

    if (bulkOps.length > 0) {
        await Product.bulkWrite(bulkOps);
    }
    order.status = 'processing';
    await order.save();

    res.json({ message: "ยืนยันออเดอร์และตัดสต็อกเรียบร้อย", order });
});

// @desc    Update order to paid
// @route   PUT /api/order/:id/pay
// @access  Private
const updateOrdertoPaid = asyncHandler(async (req, res) => {
    const { slip_url } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    if (order.user_id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        res.status(403);
        throw new Error("คุณไม่มีสิทธิ์แก้ไขออเดอร์นี้");
    }

    if (!slip_url) {
        res.status(400);
        throw new Error("ไม่พบ URL ของสลิป");
    }

    order.payment_info = {
        payment_status: 'paid',
        slip_url: slip_url,
        payment_date: new Date(),
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

export {
    createOrder,
    approveOrder,
    updateOrdertoPaid
}

