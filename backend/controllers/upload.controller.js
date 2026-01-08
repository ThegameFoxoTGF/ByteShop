import cloudinary from "../config/cloudinary.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Upload image
// @route   POST /api/upload
// @access  Public
const uploadImage = asyncHandler(async (req, res) => {

    if (!req.file) {
        res.status(400)
        throw new Error("กรุณาอัปโหลดรูปภาพ")
    }

    if (req.file) {
        const filebase64 = req.file.buffer.toString("base64");
        const dataUri = `data:${req.file.mimetype};base64,${filebase64}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "ByteShop",
            format: "webp",
            quality: "auto",
            width: 800,
            height: 800,
            crop: "limit",
            secure: true
        });
        
        res.json({
            message: "อัปโหลดรูปภาพสำเร็จ",
            public_id: result.public_id,
            url: result.url
        })
        
    } else {
        res.status(500)
        throw new Error("อัปโหลดรูปภาพไม่สำเร็จ")
    }
});

// @desc    Delete image
// @route   POST /api/delete
// @access  Public
const deleteImage = asyncHandler(async (req, res) => {
    const { public_id } = req.body;
    if (!public_id) {
        res.status(400)
        throw new Error("กรุณาให้ public_id")
    }

    const result = await cloudinary.uploader.destroy(public_id);
    res.json({
        message: "ลบรูปภาพสำเร็จ",
    })
});

export {
    uploadImage,
    deleteImage
}