import asyncHandler from "../middleware/asyncHandler.js";
import Category from "../models/category.model.js";

const getCategories = asyncHandler(async (req, res) => {
    const categories = await Category.find({});
    res.json(categories);
});

const getCategoryById = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {
        res.json(category);
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

const createCategory = asyncHandler(async (req, res) => {
    const { name, label, is_active, filters, specifications } = req.body;

    if(!name) {
        res.status(400);
        throw new Error('กรุณากรอกชื่อหมวดหมู่');
    }

    const categoryExists = await Category.findOne({ slug: name.toLowerCase().replace(/ /g, '-') });
    if (categoryExists) {
        res.status(400);
        throw new Error('ชื่อหมวดหมู่นี้ถูกใช้แล้ว');
    }

    const category = await Category.create({ 
        name,
        label,
        slug: name.toLowerCase().replace(/ /g, '-'),
        is_active,
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

const updateCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);

    if (category) {
        category.name = req.body.name || category.name;
        category.label = req.body.label || category.label;
        category.slug = req.body.name.toLowerCase().replace(/ /g, '-') || category.slug;
        category.is_active = req.body.is_active || category.is_active;
        category.filters = req.body.filters || category.filters;
        category.specifications = req.body.specifications || category.specifications;
        const updatedCategory = await category.save();
        res.json({
            message: 'หมวดหมู่ถูกอัปเดตเรียบร้อยแล้ว',
            category: updatedCategory
        });
    } else {
        res.status(404);
        throw new Error('ไม่พบข้อมูล');
    }
});

const deleteCategory = asyncHandler(async (req, res) => {
    const category = await Category.findById(req.params.id);
    if (category) {

        if(category.products.length > 0){
            res.status(400);
            throw new Error('ไม่สามารถลบหมวดหมู่ได้ เนื่องจากมีสินค้าอยู่ในหมวดหมู่นี้');
        }

        await category.deleteOne();
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