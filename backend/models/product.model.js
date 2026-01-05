import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    is_active: { type: Boolean, default: true },

    sku: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },
    
    category_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Category", 
        required: true 
    },
    brand_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Brand", 
        required: true
    },
    model_number: { type: String, trim: true },
    series: { type: String, trim: true },

    description: { type: String },
    main_image: { url: String , public_id: String },
    image: [{ url: String , public_id: String }],

    original_price: { type: Number, required: true },
    selling_price: { type: Number },
    discount: { type: Number, default: 0 },

    quantity: { type: Number, default: 0 }, 
    weight_g: { type: Number },
    dimensions: { 
        length: { type: String },
        width: { type: String },
        height: { type: String },
    },

    warranty_period: { type: Number },
    warranty_provider: { type: String },

    search_keywords: [{ type: String }],
    filters: [{ 
        key: { type: String },
        label: { type: String },
        value: { type: String },
    }],
    specifications: [{ 
        key: { type: String },
        label: { type: String },
        value: { type: String },
        unit: { type: String }
    }],
},{
    timestamps: true,
    versionKey: false
})

const Product = mongoose.model("Product", ProductSchema);

export default Product;
