import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/product.model.js";
import slugify from "slugify";

const generateRandomSku = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'SKU-';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// @desc    Fetch all products with Filter, Sort, Pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const { keyword, category, brand, minPrice, maxPrice, sort, limit, page } = req.query;
    
    let query = {};

    if (keyword) {
        query.$or = [
            { name: { $regex: keyword, $options: "i" } },
            { sku: { $regex: keyword, $options: "i" } },
            { search_keywords: { $in: [new RegExp(keyword, "i")] } }
        ];
    }

    if (category) query.category_id = category;
    if (brand) query.brand_id = brand;
    
    if (minPrice || maxPrice) {
        query.selling_price = {};
        if (minPrice) query.selling_price.$gte = Number(minPrice);
        if (maxPrice) query.selling_price.$lte = Number(maxPrice);
    }

    if (req.user && req.user.role === "admin") {
        query.is_active = { $in: [true, false] };
    } else {
        query.is_active = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === "price_asc") sortOption = { selling_price: 1 };
    if (sort === "price_desc") sortOption = { selling_price: -1 };
    if (sort === "name_asc") sortOption = { name: 1 };

    const pageSize = Number(limit) || 12;
    const pageNumber = Number(page) || 1;
    const count = await Product.countDocuments(query);

    const products = await Product.find(query)
        .populate("category_id", "name slug")
        .populate("brand_id", "name")
        .sort(sortOption)
        .limit(pageSize)
        .skip(pageSize * (pageNumber - 1));

    res.json({
        products,
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

// @desc    Fetch single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id)
        .populate("category_id", "name")
        .populate("brand_id", "name");

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }
});

// @desc    Fetch single product by Slug (URL Friendly)
// @route   GET /api/products/slug/:slug
// @access  Public
const getProductBySlug = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ slug: req.params.slug })
        .populate("category_id", "name")
        .populate("brand_id", "name");

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }
});

// @desc    Get Product by SKU (For POS / Barcode Scanner)
// @route   GET /api/products/sku/:sku
// @access  Public
const getProductBySku = asyncHandler(async (req, res) => {
    const product = await Product.findOne({ sku: req.params.sku })
        .populate("category_id", "name")
        .populate("brand_id", "name");

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error("ไม่พบสินค้า (SKU ไม่ถูกต้อง)");
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = asyncHandler(async (req, res) => {
    if (!req.body.slug && req.body.name) {
        req.body.slug = slugify(req.body.name, { lower: true, strict: true });
    }

    if (!req.body.sku) {
        req.body.sku = generateRandomSku();
    }

    const productExists = await Product.findOne({ name: req.body.name });
    if (productExists) {
        res.status(400);
        throw new Error("สินค้านี้มีอยู่ในระบบแล้ว");
    }

    const product = await Product.create(req.body);
    if (product) {
        res.json(product);
    } else {
        res.status(400);
        throw new Error("ไม่สามารถสร้างสินค้าได้");
    }
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const {
        name, original_price, discount, 
        sku, category_id, brand_id, 
        is_active, stock, weight_g, dimensions,
        warranty_period, warranty_provider,
        search_keywords, filters, specifications,
        description, main_image, image
    } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
        if (name && name != product.name) {
            product.name = name;
            product.slug = slugify(name, { lower: true, strict: true });
        }
        
        product.sku = sku || product.sku;
        product.category_id = category_id || product.category_id;
        product.brand_id = brand_id || product.brand_id;
        
        product.is_active = is_active !== undefined ? is_active : product.is_active;
        product.stock = stock !== undefined ? stock : product.stock;

        if (original_price !== undefined) product.original_price = original_price;
        if (discount !== undefined) product.discount = discount;

        product.weight_g = weight_g !== undefined ? weight_g : product.weight_g;
        product.dimensions = dimensions || product.dimensions;
        product.warranty_period = warranty_period !== undefined ? warranty_period : product.warranty_period;
        product.warranty_provider = warranty_provider || product.warranty_provider;
        product.search_keywords = search_keywords || product.search_keywords;
        product.filters = filters || product.filters;
        product.specifications = specifications || product.specifications;
        product.description = description || product.description;
        product.main_image = main_image || product.main_image;
        product.image = image || product.image;

        const updatedProduct = await product.save();
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await Product.deleteOne({ _id: product._id });
        res.json({ message: "ลบสินค้าเรียบร้อยแล้ว" });
    } else {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }
});

export {
    getProducts,
    getProductById,
    getProductBySlug,
    getProductBySku,
    createProduct,
    updateProduct,
    deleteProduct
};