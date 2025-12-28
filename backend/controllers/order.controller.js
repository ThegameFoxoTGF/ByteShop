import Order from "../models/order.model.js";
import Product from "../models/product.js";

const createOrder = async (req, res) => {
    try {
        const { order_items, shipping_address, payment_info } = req.body;

        if (!order_items || order_items.length === 0) {
            return res.status(400).json({ message: "No order items" });
        }

        // 1. Validate Stock & Calculate Prices
        let calculatedTotal = 0;
        const finalOrderItems = [];

        for (const item of order_items) { const product = await Product.findById(item.product_id);
            if (!product) {
                return res.status(404).json({ message: `Product not found: ${item.product_id}` });
            }
            if (product.quantity < item.quantity) {
                return res.status(400).json({ message: `Insufficient stock for ${product.name}` });
            }

            // Snapshot price
            const price = product.sell_price; 
            calculatedTotal += price * item.quantity;

            finalOrderItems.push({
                product_id: product._id,
                name: product.name,
                quantity: item.quantity,
                price_snapshot: price,
            });
             // Deduct stock (Simple logic)
             product.quantity -= item.quantity;
             await product.save();
        }

        // Generate Order Number
        const order_number = "ORD-" + Date.now();

        const order = await Order.create({
            order_number,
            user_id: req.user._id,
            shipping_address,
            order_items: finalOrderItems,
            payment_info,
            subtotal: calculatedTotal,
            total: calculatedTotal, // + shipping - discount logic here later
            payment_status: 'pending',
            order_status: 'pending'
        });

        res.status(201).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrders = async (req, res) => {
    try {
        // Admin sees all, User sees own
        const filter = req.user.role === 'admin' || req.user.role === 'employee' ? {} : { user_id: req.user._id };
        const orders = await Order.find(filter).sort({ created_at: -1 });
        res.status(200).json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrder = async (req, res) => { // Status update
    try {
         const order = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
         res.status(200).json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

export { createOrder, getOrders, updateOrder };
