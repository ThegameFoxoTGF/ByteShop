import asyncHandler from "../middleware/asynchandler.js";
import User from "../models/user.model.js";

const getUserWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
        .select("wishlist")
        .populate({ path: "wishlist", select: "name selling_price main_image" });

    if (user) {
        res.json({
            wishlist: user.wishlist
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

const addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const productId = req.params.product_id;

    if (user) {
        if (user.wishlist.includes(productId)) {
            res.status(400);
            throw new Error("สินค้าอยู่ในรายการโปรดแล้ว");
        }

        user.wishlist.push(productId);
        await user.save();

        res.json({
            message: "เพิ่มสินค้าเรียบร้อย",
            wishlist: user.wishlist
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

const removeFromWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const productId = req.params.product_id;

    if (user) {
        user.wishlist.pull(productId);

        await user.save();
        res.json({
            message: "ลบสินค้าเรียบร้อย",
            wishlist: user.wishlist
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

export {
    getUserWishlist,
    addToWishlist,
    removeFromWishlist
}