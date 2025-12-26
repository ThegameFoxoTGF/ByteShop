import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order_id: { type: String, required: true },
    status: { type: String, required: true },
    items: [{
        product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
        name: String,
        sku: String,
        price_snapshot: Number,
        image: String,
        quantity: { type: Number, default: 1 },
        serial_number: [String],
    }],

    coupon_id: { type: mongoose.Schema.Types.ObjectId, ref: "Coupon" },
    coupon_code: { type: String },
    coupon_discount_type: { type: String },

    payment_info: {
        payment_method: { type: String, required: true },
        payment_status: { type: String, required: true },
        transaction_id: { type: String },
        payment_date: { type: Date, required: true },
    },

    shipping_info: {
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip_code: { type: String, required: true },
        country: { type: String, required: true },
    },

    shipping_info: {
        provider: { type: String, required: true },
        tracking_number: { type: String },
        shipping_date: { type: Date },
    },

    pricing_info: {
        subtotal: { type: Number, required: true },
        discount: { type: Number, required: true },
        tax: { type: Number, required: true },
        total: { type: Number, required: true },
    },

})

const Order = mongoose.model("Order", OrderSchema);

export default Order;