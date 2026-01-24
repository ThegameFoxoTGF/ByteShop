import asyncHandler from "../middleware/asynchandler.js";
import User from "../models/user.model.js";
import Product from "../models/product.model.js";

const getUserWishlist = asyncHandler(async (req, res) => {
    const { page, limit } = req.query;
    const pageSize = Number(limit) || 12;
    const pageNumber = Number(page) || 1;

    const user = await User.findById(req.user._id).select("wishlist");

    if (!user) {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }

    const count = await Product.countDocuments({
        _id: { $in: user.wishlist },
        is_active: true
    });

    const wishlist = await Product.find({
        _id: { $in: user.wishlist },
        is_active: true
    })
        .select("name selling_price original_price discount slug main_image stock")
        .limit(pageSize)
        .skip(pageSize * (pageNumber - 1));

    res.json({
        wishlist,
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

const addToWishlist = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const productId = req.params.productId;

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
    const productId = req.params.productId;

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