import asyncHandler from "../middleware/asynchandler.js";
import Brand from "../models/brand.model.js";
import Product from "../models/product.model.js";
import slugify from "slugify";

//@desc    Fetch all brands
//@route   GET /api/brands
//@access  Public
const getBrands = asyncHandler(async (req, res) => {
    const { page, limit, keyword } = req.query;

    const pageSize = Number(limit) || 12;
    const pageNumber = Number(page) || 1;

    let query = {};
    if (keyword) {
        query.name = { $regex: keyword, $options: "i" };
    }

    const count = await Brand.countDocuments(query);
    const brands = await Brand.find(query)
        .sort({ name: 1 })
        .limit(pageSize)
        .skip(pageSize * (pageNumber - 1));

    res.json({
        brands,
        page: pageNumber,
        pages: Math.ceil(count / pageSize),
        total: count
    });
});

//@desc    Fetch single brand by ID
//@route   GET /api/brands/:id
//@access  Public
const getBrandById = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    if (brand) {
        res.json(brand);
    } else {
        res.status(404);
        throw new Error("ไม่พบแบรนด์");
    }
});

//@desc    Create a brand
//@route   POST /api/brands
//@access  Private/Admin
const createBrand = asyncHandler(async (req, res) => {
    const { name, slug } = req.body;

    const brandExists = await Brand.findOne({ name });
    if (brandExists) {
        res.status(400);
        throw new Error("ชื่อแบรนด์นี้มีอยู่ในระบบแล้ว");
    }

    if (slug) {
        const slugExists = await Brand.findOne({ slug });
        if (slugExists) {
            res.status(400);
            throw new Error("URL Slug นี้มีอยู่ในระบบแล้ว");
        }
    }

    const brandSlug = slug || slugify(name, { lower: true, strict: true });

    const brand = await Brand.create({
        name,
        slug: brandSlug,
    });

    if (brand) {
        res.json(brand);
    } else {
        res.status(400);
        throw new Error("ข้อมูลไม่ถูกต้อง");
    }
});

//@desc    Update a brand
//@route   PUT /api/brands/:id
//@access  Private/Admin
const updateBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);

    if (brand) {

        if (req.body.name && req.body.name !== brand.name) {
            brand.slug = slugify(req.body.name, { lower: true, strict: true });
        }

        if (req.body.slug) {
            brand.slug = req.body.slug;
        }

        brand.name = req.body.name || brand.name;

        const updatedBrand = await brand.save();
        res.json(updatedBrand);
    } else {
        res.status(404);
        throw new Error("แบรนด์ไม่พบ");
    }
});

//@desc    Delete a brand
//@route   DELETE /api/brands/:id
//@access  Private/Admin
const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);

    if (brand) {

        const productCount = await Product.countDocuments({ brand_id: brand._id });
        if (productCount > 0) {
            res.status(400);
            throw new Error(`ไม่สามารถลบแบรนด์ได้ เนื่องจากมี ${productCount} สินค้าอยู่ในแบรนด์นี้`);
        }

        await brand.deleteOne({ _id: brand._id });
        res.json({ message: "แบรนด์ถูกลบเรียบร้อย" });
    } else {
        res.status(404);
        throw new Error("แบรนด์ไม่พบ");
    }
});

export {
    getBrands,
    getBrandById,
    createBrand,
    updateBrand,
    deleteBrand
};
