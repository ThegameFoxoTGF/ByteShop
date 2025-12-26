import Product from "../models/product.js";

const createProduct = async (req, res) => {
    try {
        if (!req.body.sku) {
             // Simple fallback generation if not provided
            req.body.sku = "SKU-" + Date.now();
        }
        
        const product = await Product.create(req.body);
        res.status(201).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getAllProducts = async (req, res) => {
    try {
        // Support basic search/filter query params if needed later
        const products = await Product.find({ is_active: true })
            .populate("category_id", "name"); // Populate category name
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate("category_id");
            
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });

        Object.assign(product, req.body);
        const updatedProduct = await product.save(); // Triggers pre-save hooks (price calc)
        res.status(200).json(updatedProduct);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: "Product not found" });
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export {
    createProduct,
    getAllProducts,
    getProductById,
    updateProduct,
    deleteProduct
};
