import mongoose from "mongoose";

const ProductItemSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    serial_number: { type: String, required: true },
    status: { type: String, enum: ['available', 'reserved', 'sold', 'defective', 'returned'], default: 'available' },
    supplier: { type: String, trim: true },
    lot_number: { type: String, trim: true },

    //if sold
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", default: null },
    sold_at: { type: Date },
    warranty_expire_at: { type: Date },
},{
    timestamps: true,
    versionKey: false
})

const ProductItem = mongoose.model("ProductItem", ProductItemSchema);

export default ProductItem;