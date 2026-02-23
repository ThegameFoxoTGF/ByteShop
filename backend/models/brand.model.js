import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    slug: {
        type: String,
        required: true,

    },

}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Brand", brandSchema);