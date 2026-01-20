import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/product.model.js";
import Category from "../models/category.model.js";
import slugify from "slugify";
import cloudinary from "../config/cloudinary.js";

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
    const { keyword, category, brand, minPrice, maxPrice, sort, limit, page, filters } = req.query;

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

    if (req.user && req.user.isAdmin === true) {
        query.is_active = { $in: [true, false] };
    } else {
        query.is_active = true;
    }

    // Dynamic Attribute Filters
    if (filters && typeof filters === 'object') {
        const filterKeys = Object.keys(filters);
        if (filterKeys.length > 0) {
            if (!query.$and) query.$and = [];

            filterKeys.forEach(key => {
                const value = filters[key];
                if (value) {
                    query.$and.push({
                        filters: {
                            $elemMatch: { key: key, value: value }
                        }
                    });
                }
            });
        }
    }

    const pageSize = Number(limit) || 12;
    const pageNumber = Number(page) || 1;
    const count = await Product.countDocuments(query);

    let products = [];

    if (!sort) {
        const aggregatePipeline = [
            { $match: query },
            { $addFields: { hasStock: { $gt: ["$stock", 0] } } },
            { $sort: { hasStock: -1, createdAt: -1 } },
            { $skip: pageSize * (pageNumber - 1) },
            { $limit: pageSize },
            { $project: { _id: 1 } }
        ];

        const aggregatedIds = await Product.aggregate(aggregatePipeline);
        const ids = aggregatedIds.map(item => item._id);

        const productsUnsorted = await Product.find({ _id: { $in: ids } })
            .populate("category_id", "name slug")
            .populate("brand_id", "name")
            .select("name sku original_price discount selling_price stock main_image is_active category_id brand_id filters");

        products = ids.map(id => productsUnsorted.find(p => p._id.toString() === id.toString())).filter(Boolean);

    } else {
        let sortOption = {};
        if (sort === "price_asc") sortOption = { selling_price: 1 };
        else if (sort === "price_desc") sortOption = { selling_price: -1 };
        else if (sort === "name_asc") sortOption = { name: 1 };
        else sortOption = { stock: -1, createdAt: -1 };

        products = await Product.find(query)
            .populate("category_id", "name slug")
            .populate("brand_id", "name")
            .select("name sku original_price discount selling_price stock main_image is_active category_id brand_id filters")
            .sort(sortOption)
            .limit(pageSize)
            .skip(pageSize * (pageNumber - 1));
    }

    res.json({
        products,
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

// @desc    Get Available Filters for a Category based on Products
// @route   GET /api/products/filters/:categoryId
// @access  Public
const getCategoryFilters = asyncHandler(async (req, res) => {
    const { categoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category) {
        res.status(404);
        throw new Error("Category not found");
    }

    const filterResults = [];

    if (category.filters && category.filters.length > 0) {
        for (const filterDef of category.filters) {
            // Get values actually used by products
            const distinctValues = await Product.distinct("filters.value", {
                category_id: categoryId,
                "filters.key": filterDef.key,
                is_active: true
            });

            // Merge with pre-defined options from Category settings
            const availableOptions = [...new Set([
                ...(filterDef.options || []),
                ...distinctValues
            ])].sort();

            if (availableOptions.length > 0) {
                filterResults.push({
                    key: filterDef.key,
                    label: filterDef.label,
                    options: availableOptions
                });
            }
        }
    }

    res.json(filterResults);
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
        // Image Cleanup Logic
        if (main_image && product.main_image && product.main_image.public_id && main_image.public_id !== product.main_image.public_id) {
            try {
                await cloudinary.uploader.destroy(product.main_image.public_id);
            } catch (err) {
                console.error("Failed to delete old main image:", err);
            }
        }

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
        // Delete images from Cloudinary
        if (product.main_image && product.main_image.public_id) {
            await cloudinary.uploader.destroy(product.main_image.public_id);
        }
        if (product.image && product.image.length > 0) {
            for (const img of product.image) {
                if (img.public_id) {
                    await cloudinary.uploader.destroy(img.public_id);
                }
            }
        }

        await Product.deleteOne({ _id: product._id });
        res.json({ message: "ลบสินค้าและรูปภาพเรียบร้อยแล้ว" });
    } else {
        res.status(404);
        throw new Error("ไม่พบสินค้านี้");
    }
});

export {
    getProducts,
    getCategoryFilters,
    getProductById,
    getProductBySlug,
    getProductBySku,
    createProduct,
    updateProduct,
    deleteProduct
};