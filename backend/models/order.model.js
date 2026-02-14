import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    order_id: { type: String, required: true },
    status: {
        type: String, enum: [
            "pending", //รอการชำระเงิน
            "processing", //COD ยืนยันแล้ว
            "waiting_verification", //รอการตรวจสอบ
            "paid", //โอนและตรวจสอบแล้ว
            "shipped", //ส่งแล้ว
            "completed", //สั่งซื้อสำเร็จ
            "cancelled", //ยกเลิก
        ],
        default: "pending"
    },
    items: [{
        product_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        name: { type: String, required: true },
        main_image: { url: String, public_id: String },
        price_snapshot: { type: Number, required: true },
        quantity: { type: Number, default: 1 },
    }],

    coupon_info: {
        coupon_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Coupon"
        },
        coupon_code: { type: String },
        coupon_discount_type: { type: String, enum: ["fixed", "percentage"] },
    },

    payment_method: { type: String, enum: ['cod', 'bank_transfer'], required: true },
    payment_info: {
        payment_status: { type: String, enum: ['pending', 'paid', 'failed', 'cancelled', 'refunded'], default: 'pending' },
        slip_url: { url: String, public_id: String },
        payment_date: { type: Date },
    },

    shipping_address: {
        name: { type: String, trim: true },
        phone_number: { type: String, trim: true },
        address_line: { type: String, trim: true },
        sub_district: { type: String, trim: true },
        district: { type: String, trim: true },
        province: { type: String, trim: true },
        zip_code: { type: String, trim: true, maxlength: 5, minlength: 5 },
        detail: { type: String, trim: true },
    },

    shipping_info: {
        provider: { type: String },
        tracking_number: { type: String },
        delivered_at: { type: Date },
        is_delivered: { type: Boolean, default: false },
    },

    pricing_info: {
        subtotal: { type: Number, default: 0 }, //ราคาสินค้ารวม
        discount: { type: Number, default: 0 }, //ราคาส่วนลด
        shipping_fee: { type: Number, default: 0 }, //ค่าส่ง
        subtotal_before_tax: { type: Number, default: 0 },
        tax_price: { type: Number, default: 0 }, //ภาษี
        total_price: { type: Number, default: 0 }, //รวม
    },

}, {
    timestamps: true,
    versionKey: false
})

const Order = mongoose.model("Order", OrderSchema);

export default Order;