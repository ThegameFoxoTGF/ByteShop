import mongoose from "mongoose";

const fieldTemplate = new mongoose.Schema({
    key: { type: String },
    label: { type: String },
    type: { type: String },
    unit: { type: String },
    options: [String]
}, { _id: false })

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true, unique: true },
    label: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true },

    filters: [fieldTemplate],
    specifications: [fieldTemplate],

}, {
    timestamps: true,
    versionKey: false
})

const Category = mongoose.model("Category", CategorySchema);

export default Category;
