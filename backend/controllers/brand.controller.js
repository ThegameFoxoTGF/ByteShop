import asyncHandler from "../middleware/asyncHandler.js";
import Brand from "../models/brand.js";

const getBrands = asyncHandler(async (req, res) => {
    const brands = await Brand.find({});
    res.json(brands);
});

const createBrand = asyncHandler(async (req, res) => {
    const { name, image, description } = req.body;

    const brandExists = await Brand.findOne({ name });
    if (brandExists) {
        res.status(400);
        throw new Error("แบรนด์นี้มีอยู่แล้ว");
    }

    const brand = await Brand.create({
        name,
        slug: name.toLowerCase().replace(/ /g, "-"),
        image: {
            url: image.url,
            public_id: image.public_id,
        },
        description,
    });

    if (brand) {
        res.status(201).json({
            _id: brand._id,
            name: brand.name,
            slug: brand.slug,
            image: brand.image,
            description: brand.description,
        });
    } else {
        res.status(400);
        throw new Error("ข้อมูลไม่ถูกต้อง");
    }
});

const updateBrand = asyncHandler(async (req, res) => {
    const { name, image, description } = req.body;

    const brand = await Brand.findById(req.params.id);

    if (brand) {
        brand.name = name;
        brand.slug = name.toLowerCase().replace(/ /g, "-");
        brand.image = {
            url: image.url,
            public_id: image.public_id,
        };
        brand.description = description;

        const updatedBrand = await brand.save();
        res.json({
            _id: updatedBrand._id,
            name: updatedBrand.name,
            slug: updatedBrand.slug,
            image: updatedBrand.image,
            description: updatedBrand.description,
        });
    } else {
        res.status(404);
        throw new Error("แบรนด์ไม่พบ");
    }
});

const deleteBrand = asyncHandler(async (req, res) => {
    const brand = await Brand.findById(req.params.id);
    const products = await Product.find({ brand: req.params.id });

    if (brand) {
        if (products.length > 0) {
            res.status(400);
            throw new Error("แบรนด์มีสินค้าอยู่");
        }
        await brand.remove();
        res.json({ message: "แบรนด์ถูกลบ" });
    } else {
        res.status(404);
        throw new Error("แบรนด์ไม่พบ");
    }
});

export { getBrands, createBrand, updateBrand, deleteBrand };

