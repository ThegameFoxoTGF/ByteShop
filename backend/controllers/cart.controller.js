import Cart from "../models/cart.js";

const getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user_id: req.user._id }).populate("cartitems.product_id");
        if (!cart) {
            cart = await Cart.create({ user_id: req.user._id, cartitems: [] });
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addToCart = async (req, res) => {
    const { product_id, quantity } = req.body;
    try {
        let cart = await Cart.findOne({ user_id: req.user._id });

        if (cart) {
            const itemIndex = cart.cartitems.findIndex(p => p.product_id == product_id);

            if (itemIndex > -1) {
                // Product exists, update quantity
                cart.cartitems[itemIndex].quantity += quantity;
            } else {
                // Add new item
                cart.cartitems.push({ product_id, quantity });
            }
            await cart.save();
        } else {
            // New cart
            cart = await Cart.create({
                user_id: req.user._id,
                cartitems: [{ product_id, quantity }]
            });
        }
        
        // Populate and return
        cart = await cart.populate("cartitems.product_id");
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const removeFromCart = async (req, res) => {
    const { product_id } = req.body; // or params
    try {
        let cart = await Cart.findOne({ user_id: req.user._id });
        if (cart) {
            cart.cartitems = cart.cartitems.filter(item => item.product_id != product_id);
            await cart.save();
            cart = await cart.populate("cartitems.product_id");
        }
        res.status(200).json(cart);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export { getCart, addToCart, removeFromCart };
