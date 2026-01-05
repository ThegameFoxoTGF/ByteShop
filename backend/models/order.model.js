import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User", 
        required: true 
    },
    order_id: { type: String, required: true },
    status: { type: String, required: true },
    items: [{
        product_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Product", 
            required: true
        },
        //ไม่จำเป็นต้องไปดึงข้อมูลจาก product
        name: { type: String, required: true },
        sku: { type: String, required: true },
        slug: { type: String, required: true },
        price_snapshot: { type: Number, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, default: 1 },
        serial_number: [{ type: String }],
    }],

    coupon_info: {
        coupon_id: { 
            type: mongoose.Schema.Types.ObjectId, 
            ref: "Coupon" 
        },
        coupon_code: { type: String },
        coupon_discount_type: { type: String },
    },

    payment_method: { type: String, required: true },
    payment_info: {
        payment_status: { type: String, required: true },
        transaction_id: { type: String },
        payment_date: { type: Date },
    },

    shipping_address: {
        address_line: { type: String, trim: true },
        sub_district: { type: String, trim: true },
        district: { type: String, trim: true },
        province: { type: String, trim: true },
        zip_code: { type: String, trim: true, maxlength: 5, minlength: 5 },
        detail: { type: String, trim: true },
    },

    shipping_info: {
        provider: { type: String, required: true },
        tracking_number: { type: String },
        delivered_at: { type: Date },
        is_delivered: { type: Boolean, required: true },
    },

    pricing_info: {
        subtotal: { type: Number, required: true }, //ราคาสินค้ารวม
        discount: { type: Number, required: true }, //ราคาส่วนลด
        shipping_price: { type: Number, required: true }, //ค่าส่ง
        tax_price: { type: Number, required: true }, //ภาษี
        total_price: { type: Number, required: true }, //รวม
    },

},{
    timestamps: true,
    versionKey: false
})

const Order = mongoose.model("Order", OrderSchema);

export default Order;