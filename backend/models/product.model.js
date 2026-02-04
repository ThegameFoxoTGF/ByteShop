import mongoose from "mongoose";

const fieldTemplate = new mongoose.Schema({
  key: { type: String },
  label: { type: String },
  value: { type: mongoose.Schema.Types.Mixed }, // String or Array
  type: { type: String },
  unit: { type: String },
}, { _id: false })

const ProductSchema = new mongoose.Schema(
  {
    is_active: { type: Boolean, default: true },

    sku: { type: String, unique: true, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true },

    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Brand",
      required: true,
    },

    description: { type: String },
    main_image: { url: String, public_id: String },
    image: [{ url: String, public_id: String }],

    original_price: { type: Number, required: true },
    selling_price: { type: Number },
    discount: { type: Number, default: 0 },

    stock: { type: Number, default: 0 },

    warranty_period: { type: Number },
    warranty_provider: { type: String },

    search_keywords: [{ type: String }],
    filters: [fieldTemplate],
    specifications: [fieldTemplate],
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

ProductSchema.pre("save", function (next) {
  if (this.isModified("original_price") || this.isModified("discount")) {
    this.selling_price = this.original_price - (this.discount || 0);

    if (this.selling_price < 0) this.selling_price = this.original_price;
  }
  next();
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
