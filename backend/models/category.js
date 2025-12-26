import mongoose from "mongoose";

const fieldTemplate = new mongoose.Schema({
    key: { type: String },
    label: { type: String },
    type: { type: String },
    unit: { type: String },
    options: [{ type: String }]
}, { _id: false })

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    slug: { type: String, required: true, unique: true },
    parent: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    children: [{ type: mongoose.Schema.Types.ObjectId, ref: "Category" }],
    is_active: { type: Boolean, default: true },

    search_keywords: [ String ],
    filters: [fieldTemplate],
    specifications: [fieldTemplate],

},{
    timestamps: true,
    versionKey: false
})

const Category = mongoose.model("Category", CategorySchema);

export default Category;
