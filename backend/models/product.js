import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    is_active: { type: Boolean, default: true },

    sku: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    brand: { type: String, trim: true },
    model_number: { type: String, trim: true },
    series: { type: String, trim: true },

    description: { type: String },
    image: [ String ],

    sell_price: { type: Number, required: true },
    market_price: { type: Number },
    discount: { type: Number, default: 0 },

    quantity: { type: Number, default: 0 }, 
    weight_g: Number,
    dimensions: { 
        length: String,
        width: String,
        height: String,
     },

    track_serial: { type: Boolean, default: false },
    low_stock_alert: { type: Number, default: 5 },

    warranty_period: { type: Number },
    warranty_provider: { type: String },

    search_keywords: [ String ],
    filters: [{ 
        key: String,
        label: String,
        value: String,
     }],
    specifications: [{ 
        key: String,
        label: String,
        value: String,
        unit: String
     }],
},{
    timestamps: true,
    versionKey: false
})

const Product = mongoose.model("Product", ProductSchema);

export default Product;
