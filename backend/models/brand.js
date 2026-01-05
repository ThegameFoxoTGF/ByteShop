import mongoose from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
    },
    image: {
        url: String,
        public_id: String
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model("Brand", brandSchema);