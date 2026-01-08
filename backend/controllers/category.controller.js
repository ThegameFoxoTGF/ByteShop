import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/category.model.js";
import Product from "../models/product.model.js";
import slugify from "slugify";

//@desc    Fetch all categories
//@route   GET /api/categories
//@access  Public
const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({}).sort({ name: 1 });
    res.json(categories);
});

//@desc    Fetch single category by ID
//@route   GET /api/categories/:id
//@access  Public
const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

//@desc    Create a category
//@route   POST /api/categories
//@access  Private/Admin
const createCategory = asyncHandler(async (req, res) => {
    const { name, label, slug, filters, specifications } = req.body;

    if(!name) {
        res.status(400);
        throw new Error('กรุณากรอกชื่อหมวดหมู่');
    }

    const categoryExists = await Category.findOne({ name });
    if (categoryExists) {
        res.status(400);
        throw new Error('ชื่อหมวดหมู่นี้ถูกใช้แล้ว');
    }

    const categorySlug = slug || slugify(name, { lower: true, strict: true });

    const category = await Category.create({ 
        name,
        label,
        slug: categorySlug,
        filters,
        specifications
    });
    
    if (category){
        res.json({
            message: 'หมวดหมู่ถูกสร้างเรียบร้อยแล้ว',
            category
        });
    } else {
        res.status(400);
        throw new Error('ไม่สามารถสร้างหมวดหมู่ได้');
    }

});

//@desc    Update a category
//@route   PUT /api/categories/:id
//@access  Private/Admin
const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        if (req.body.name && req.body.name !== category.name) {
            category.slug = slugify(req.body.name, { lower: true, strict: true });
        }

        if (req.body.slug ) {
            category.slug = req.body.slug;
        }

        category.name = req.body.name || category.name;
        category.label = req.body.label || category.label;
        if (req.body.filters !== undefined) {
            category.filters = req.body.filters;
        }
        if (req.body.specifications !== undefined) {
            category.specifications = req.body.specifications;
        }
        const updatedCategory = await category.save();

        if (updatedCategory) {
            res.json({
                message: 'หมวดหมู่ถูกอัปเดตเรียบร้อยแล้ว',
                updatedCategory
            });
        } else {
            res.status(400);
            throw new Error('ไม่สามารถอัปเดตหมวดหมู่ได้');
        }
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

//@desc    Delete a category
//@route   DELETE /api/categories/:id
//@access  Private/Admin
const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {

        const productCount = await Product.countDocuments({ category_id: category._id });
        if (productCount > 0) {
            res.status(400);
            throw new Error(`ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมี ${productCount} สินค้าอยู่ในหมวดหมู่นี้`);
        }

        await category.deleteOne({_id: category._id});
        res.json({
            message: 'หมวดหมู่ถูกลบเรียบร้อยแล้ว'
        });
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

export {
    getCategories,
    getCategoryById,
    createCategory,
    updateCategory,
    deleteCategory
}