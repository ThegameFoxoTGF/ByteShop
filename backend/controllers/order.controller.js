import asyncHandler from "../middleware/asynchandler.js";
import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import Coupon from "../models/coupon.model.js";
import cloudinary from "../config/cloudinary.js";

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

        if (!product || item.quantity > product.stock) {
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

        if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
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
        } else if (coupon.discount_type === 'fixed') {
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

    let status = "pending";
    if (payment_method === 'cod') {
        status = "processing";
    }

    const order = await Order.create({
        user_id: req.user._id,
        order_id: generateOrderNumber(),
        items: orderItems,
        status: status,
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

    if (status === 'processing') {
        // If COD (Processing), deduct stock immediately
        const bulkOps = orderItems.map(item => ({
            updateOne: {
                filter: { _id: item.product_id },
                update: { $inc: { stock: -item.quantity } }
            }
        }));
        if (bulkOps.length > 0) {
            await Product.bulkWrite(bulkOps);
        }
    }

    await Cart.findByIdAndDelete(cart._id);

    res.json(order);

});

// @desc    Get all orders
// @route   GET /api/order
// @access  Private
const getAllOrders = asyncHandler(async (req, res) => {
    const { page, limit, status, keyword } = req.query;

    let query = {};
    if (req.user && !req.user.isAdmin) {
        query.user_id = req.user._id;
    }

    if (status) {
        query.status = status;
    }

    if (keyword) {
        query.order_id = { $regex: keyword, $options: 'i' };
    }

    const pageSize = Number(limit) || 10;
    const pageNumber = Number(page) || 1;
    const count = await Order.countDocuments(query);

    const orders = await Order.find(query)
        .populate('user_id', 'id email profile')
        .sort({ createdAt: -1 })
        .limit(pageSize)
        .skip(pageSize * (pageNumber - 1));

    res.json({
        orders,
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

// @desc    Get order by order id
// @route   GET /api/order/:id
// @access  Private
const getByOrderId = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user_id', 'id email profile');
    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }
    res.json(order);
});

// @desc    Update order to paid (Upload Slip) - Waiting for Admin Confirmation
// @route   PUT /api/order/:id/pay
// @access  Private
const updateOrderToPaid = asyncHandler(async (req, res) => {
    const { url, public_id } = req.body;
    const order = await Order.findById(req.params.id);
    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    // Check if there is an existing slip and delete it
    if (order.payment_info && order.payment_info.slip_url && order.payment_info.slip_url.public_id) {
        try {
            await cloudinary.uploader.destroy(order.payment_info.slip_url.public_id);
        } catch (error) {
            console.error("Failed to delete old slip:", error);
        }
    }

    const updatedOrder = await Order.findByIdAndUpdate(
        req.params.id,
        {
            status: 'waiting_verification',
            payment_info: {
                payment_status: 'paid',
                slip_url: { url, public_id },
                payment_date: new Date(),
            },
        },
        { new: true }
    );

    if (!updatedOrder) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    res.json(updatedOrder);
});

// @desc    Update shipping address
// @route   PUT /api/order/:id/address
// @access  Private
const updateOrderAddress = asyncHandler(async (req, res) => {
    const { shipping_address } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    // Only allow address update if not shipped yet
    if (['shipped', 'completed', 'cancelled'].includes(order.status)) {
        res.status(400);
        throw new Error("ไม่สามารถแก้ไขที่อยู่ได้แล้ว");
    }

    order.shipping_address = shipping_address;
    const updatedOrder = await order.save();

    res.json(updatedOrder);
});

// @desc    Cancel order
// @route   PUT /api/order/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    // Check user ownership
    if (order.user_id.toString() !== req.user._id.toString()) {
        res.status(401);
        throw new Error("ไม่มีสิทธิ์ยกเลิกคำสั่งซื้อนี้");
    }

    if (order.status !== 'pending') {
        res.status(400);
        throw new Error("สามารถยกเลิกได้เฉพาะคำสั่งซื้อที่รอชำระเงินเท่านั้น");
    }

    order.status = 'cancelled';
    const updatedOrder = await order.save();

    res.json(updatedOrder);
});

// @desc    Update order status (Admin)
// @route   PUT /api/order/:id/status
// @access  Private/Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status, tracking_number, provider } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
        res.status(404);
        throw new Error("ไม่พบคำสั่งซื้อ");
    }

    // Logic for Cancellation / Refund
    if (status === 'cancelled') {
        const activeStatuses = ['processing', 'paid', 'shipped', 'completed'];

        // 1. Restock if order was in active status (meaning stock was previously deducted)
        if (activeStatuses.includes(order.status)) {
            const bulkOps = order.items.map(item => ({
                updateOne: {
                    filter: { _id: item.product_id },
                    update: { $inc: { stock: item.quantity } }
                }
            }));
            if (bulkOps.length > 0) {
                await Product.bulkWrite(bulkOps);
            }
        }

        // 2. Handle Payment Status
        if (req.body.is_refund) {
            order.payment_info.payment_status = 'refunded';
        }

        order.status = 'cancelled';

    } else {
        // Stock Deduction Logic (Pending -> Active Status)
        // If transitioning from Pending/Waiting to a "Confirmed" state, deduct stock
        const activeStatuses = ['processing', 'paid', 'shipped', 'completed'];
        const pendingStatuses = ['pending', 'waiting_verification'];

        if (pendingStatuses.includes(order.status) && activeStatuses.includes(status)) {
            const bulkOps = [];
            for (const item of order.items) {
                const product = await Product.findById(item.product_id);
                if (!product) throw new Error(`สินค้า ${item.name} หาไม่เจอในระบบ`);
                if (product.stock < item.quantity) throw new Error(`สินค้า ${product.name} คงเหลือไม่พอ (เหลือ ${product.stock})`);

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
        }

        order.status = status;

        // Shipping Info Update
        if (status === 'shipped') {
            if (tracking_number) order.shipping_info.tracking_number = tracking_number;
            if (provider) order.shipping_info.provider = provider;
            order.shipping_info.is_delivered = false;
        }

        // Delivery Completion
        if (status === 'completed') {
            order.shipping_info.is_delivered = true;
            order.shipping_info.delivered_at = new Date();

            // Special Case: COD, when completed => Payment Paid
            if (order.payment_method === 'cod') {
                order.payment_info.payment_status = 'paid';
                if (!order.payment_info.payment_date) {
                    order.payment_info.payment_date = new Date();
                }
            }
        }
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
});

export {
    createOrder,
    getAllOrders,
    getByOrderId,
    updateOrderToPaid,
    updateOrderAddress,
    cancelOrder,
    updateOrderStatus
}
