import cloudinary from "../config/cloudinary.js";
import asyncHandler from "../middleware/asynchandler.js";

const uploadToCloudinary = async (file, folder, width, height, crop) => {
    if (!file) throw new Error("กรุณาอัปโหลดรูปภาพ");

    const filebase64 = file.buffer.toString("base64");
    const dataUri = `data:${file.mimetype};base64,${filebase64}`;

    try {

        const options = {
            folder: folder,
            format: "webp",
            quality: "auto",
            secure: true,
            crop: crop,
            width: width,
            ...(height && { height: height })
        };

        if (crop === "fill") {
            options.gravity = "auto";
        }


        return await cloudinary.uploader.upload(dataUri, options);
    } catch (error) {
        console.error("Cloudinary Upload Error:", error);
        throw new Error(`Cloudinary Error: ${error.message}`);
    }
};

// @desc    Upload image or slip
// @route   POST /api/upload OR /api/upload/slip
// @access  Public
const uploadImage = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("กรุณาอัปโหลดรูปภาพ");
    }

    const isSlip = req.path.includes("slip") || req.baseUrl.includes("slip");

    const folder = isSlip ? "ByteShop/slip" : "ByteShop/images";
    const width = isSlip ? 500 : 800;
    const height = isSlip ? undefined : 800;
    const crop = isSlip ? "limit" : "fill";

    const result = await uploadToCloudinary(req.file, folder, width, height, crop);

    res.json({
        message: "อัปโหลดรูปภาพสำเร็จ",
        public_id: result.public_id,
        url: result.secure_url
    });
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