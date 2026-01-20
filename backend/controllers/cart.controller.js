import asyncHandler from "../middleware/asynchandler.js";
import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";

const calculateTotalPrice = (cart) => {
    let total_price = 0;

    const validItems = cart.items.filter(item => item.product !== null);

    validItems.forEach(item => {
        const price = item.product.selling_price || item.product.original_price;
        total_price += price * item.quantity;
    })

    return {
        items: validItems,
        total_price: total_price,
    };
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getUserCart = asyncHandler(async (req, res) => {
    const cart = await Cart.findOne({ user: req.user._id })
        .populate({
            path: "items.product",
            select: "name original_price selling_price discount main_image stock"
        });

    if (!cart) {
        return res.status(200).json({
            cart: null
        })
    }

    let isChanged = false;

    cart.items.forEach(item => {
        const product = item.product;
        // Check if product exists (it should due to populate, but safety first)
        if (product && item.quantity > product.stock) {
            item.quantity = product.stock;
            isChanged = true;
        }
    });

    if (isChanged) {
        await cart.save();
    }

    const { items, total_price } = calculateTotalPrice(cart);

    res.json({
        _id: cart._id,
        items,
        total_price,
        message: isChanged ? "รายการสินค้าบางรายการถูกปรับจำนวนลงเนื่องจากสินค้าคงเหลือไม่เพียงพอ" : undefined
    });
});

// @desc    Add to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
    const { productId, quantity } = req.body;
    const user = req.user._id;

    if (!quantity || quantity < 1) {
        res.status(400)
        throw new Error("จำนวนสินค้าต้องมากกว่า 0")
    }

    const product = await Product.findById(productId);
    if (!product) {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }

    let cart = await Cart.findOne({ user });
    let currentQuantity = 0;

    if (cart) {
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);
        if (itemIndex !== -1) {
            currentQuantity = cart.items[itemIndex].quantity;
        }
    }

    let quantityToAdd = quantity;
    let message = undefined;

    if (currentQuantity + quantity > product.stock) {
        quantityToAdd = product.stock - currentQuantity;

        if (quantityToAdd <= 0) {
            res.status(400);
            throw new Error("ขออภัย สินค้าไม่เพียงพอ");
        }

        message = `เพิ่มสินค้าได้เพียง ${quantityToAdd} ชิ้น เนื่องจากสินค้ามีจำกัด`;
    }

    if (!cart) {
        cart = await Cart.create({ user: user, items: [{ product: productId, quantity: quantityToAdd }] })
    } else {
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex !== -1) {
            cart.items[itemIndex].quantity += quantityToAdd;
        } else {
            cart.items.push({ product: productId, quantity: quantityToAdd })
        }
    }

    await cart.save();

    await cart.populate({
        path: "items.product",
        select: "name original_price selling_price discount main_image stock"
    });

    const { items, total_price } = calculateTotalPrice(cart);

    res.json({
        _id: cart._id,
        items,
        total_price,
        message
    })
});

// @desc    Update cart
// @route   PUT /api/cart/:productId
// @access  Private
const updateCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;
    const user = req.user._id;

    if (!quantity || quantity < 1) {
        res.status(400)
        throw new Error("จำนวนสินค้าต้องมีอย่างน้อย 1 ชิ้น")
    }

    // Check stock but cap instead of error if requested > stock
    const productToCheck = await Product.findById(productId);
    if (!productToCheck) {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }

    let finalQuantity = quantity;
    if (quantity > productToCheck.stock) {
        finalQuantity = productToCheck.stock;
        // Optionally warn user? But backend just returns json. 
        // The frontend will receive the updated cart with the capped quantity.
    }

    // await checkProductStock(productId, quantity); // Removed throwing check

    const cart = await Cart.findOne({ user });
    if (!cart) {
        res.status(404)
        throw new Error("ไม่พบตะกร้าของคุณ")
    }

    const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIndex !== -1) {

        cart.items[itemIndex].quantity = finalQuantity;
        await cart.save();

        await cart.populate({
            path: "items.product",
            select: "name original_price selling_price discount main_image stock"
        });

        const { items, total_price } = calculateTotalPrice(cart);

        res.json({
            _id: cart._id,
            items,
            total_price,
            message: finalQuantity < quantity ? `จำนวนสินค้าไม่เพียงพอ` : undefined
        });
    } else {
        res.status(404)
        throw new Error("ไม่พบสินค้านี้ในตะกร้าของคุณ")
    }
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:productId
// @access  Private
const removeItemFromCart = asyncHandler(async (req, res) => {
    const { productId } = req.params;
    const user = req.user._id;

    const cart = await Cart.findOneAndUpdate(
        { user },
        { $pull: { items: { product: productId } } },
        { new: true }
    );

    if (!cart) {
        res.status(404)
        throw new Error("ไม่พบตะกร้าของคุณ")
    }

    if (cart.items.length === 0) {
        await Cart.findByIdAndDelete(cart._id);

        return res.json({
            message: "ลบสินค้าออกจากตะกร้าสำเร็จ",
            cart: null
        })
    }

    await cart.populate({
        path: "items.product",
        select: "name original_price selling_price discount main_image"
    });

    const { items, total_price } = calculateTotalPrice(cart);

    res.json({
        _id: cart._id,
        items,
        total_price,
    })

});

export {
    getUserCart,
    addToCart,
    updateCart,
    removeItemFromCart,
}
