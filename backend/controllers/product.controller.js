import asyncHandler from "../middleware/asyncHandler.js";
import Product from "../models/product.model.js";

const getProducts = asyncHandler(async (req, res) => {
    const products = await Product.find({});
    res.json(products);
});

const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

const createProduct = asyncHandler(async (req, res) => {
    const product = await Product.create({
        sku: "sky"+Date.now()+Math.floor(Math.random() * 100000),
        name: req.body.name,
        slug: req.body.name.toLowerCase().replace(/ /g, '-'),
        category_id: req.body.category_id,
        brand_id: req.body.brand_id,
        model_number: req.body.model_number,
        series: req.body.series,
        description: req.body.description,
        main_image: req.body.main_image,
        image: req.body.image,
        original_price: req.body.original_price,
        selling_price: req.body.selling_price,
        discount: req.body.discount,
        quantity: req.body.quantity,
        weight_g: req.body.weight_g,
        dimensions: req.body.dimensions,
        warranty_period: req.body.warranty_period,
        warranty_provider: req.body.warranty_provider,
        search_keywords: req.body.search_keywords,
        filters: req.body.filters,
        specifications: req.body.specifications
    });
    if (product) {
        res.json({
            message: 'สินค้าถูกสร้างเรียบร้อยแล้ว',
            product
        });
    } else {
        res.status(400);
        throw new Error('ไม่สามารถสร้างสินค้าได้');
    }
});

const updateProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        product.name = req.body.name || product.name;
        product.slug = req.body.name.toLowerCase().replace(/ /g, '-') || product.slug;
        product.category_id = req.body.category_id || product.category_id;
        product.brand_id = req.body.brand_id || product.brand_id;
        product.model_number = req.body.model_number || product.model_number;
        product.series = req.body.series || product.series;
        product.description = req.body.description || product.description;
        product.main_image = req.body.main_image || product.main_image;
        product.image = req.body.image || product.image;
        product.original_price = req.body.original_price || product.original_price;
        product.selling_price = req.body.selling_price || product.selling_price;
        product.discount = req.body.discount || product.discount;
        product.quantity = req.body.quantity || product.quantity;
        product.weight_g = req.body.weight_g || product.weight_g;
        product.dimensions = req.body.dimensions || product.dimensions;
        product.warranty_period = req.body.warranty_period || product.warranty_period;
        product.warranty_provider = req.body.warranty_provider || product.warranty_provider;
        product.search_keywords = req.body.search_keywords || product.search_keywords;
        product.filters = req.body.filters || product.filters;
        product.specifications = req.body.specifications || product.specifications;
        const updatedProduct = await product.save();
        res.json({
            message: 'สินค้าถูกอัปเดตเรียบร้อยแล้ว',
            product: updatedProduct
        });
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        await product.deleteOne();
        res.json({
            message: 'สินค้าถูกลบเรียบร้อยแล้ว'
        });
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

export {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}

