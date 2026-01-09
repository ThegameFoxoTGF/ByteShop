import asyncHandler from "../middleware/asyncHandler.js";
import User from "../models/user.model.js";

// @desc    Add Address
// @route   POST /api/address/shipping
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {

        if (req.body.is_default) {
            user.address.forEach((address) => {
                address.is_default = false;
            });
        }

        if (req.body.zip_code.length != 5) {
            res.status(400);
            throw new Error("รหัสไปรษณีย์ไม่ถูกต้อง");
        }

        user.address.push(req.body);
        await user.save();

        res.json({
            address: user.address
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Get Address
// @route   GET /api/address/shipping
// @access  Private
const getAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("address");

    if (user) {
        res.json({
            address: user.address
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Update Address
// @route   PUT /api/address/shipping/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.address.id(req.params.id);

    if (user) {
        if (req.body.is_default) {
            user.address.forEach((address) => {
                address.is_default = false;
            });
        }

        if (req.body.zip_code.length != 5) {
            res.status(400);
            throw new Error("รหัสไปรษณีย์ไม่ถูกต้อง");
        }

        Object.assign(address, req.body);
        await user.save();

        res.json({
            address
        });
    } else {
        res.status(404);
        throw new Error("ข้อมูลไม่ถูกต้อง");
    }
});

// @desc    Delete Address
// @route   DELETE /api/address/shipping/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const address = user.address.id(req.params.id);

    if (address) {
        address.deleteOne();
        await user.save();

        res.json({
            message: "ลบที่อยู่เรียบร้อย"
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบที่อยู่");
    }
});

// @desc    Add Tax
// @route   POST /api/address/tax
// @access  Private
const addTax = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {

        if (req.body.is_default) {
            user.tax_info.forEach((tax_info) => {
                tax_info.is_default = false;
            });
        }

        if (req.body.zip_code.length != 5) {
            res.status(400);
            throw new Error("รหัสไปรษณีย์ไม่ถูกต้อง");
        }

        user.tax_info.push(req.body);
        await user.save();

        res.json({
            tax_info: user.tax_info
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Get Tax
// @route   GET /api/address/tax
// @access  Private
const getTax = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id).select("tax_info");
    
    if (user) {
        res.json(user.tax_info);
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Update Tax
// @route   PUT /api/address/tax/:id
// @access  Private
const updateTax = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const tax = user.tax_info.id(req.params.id);

    if (tax) {
        if (req.body.is_default) {
            user.tax_info.forEach((tax_info) => {
                tax_info.is_default = false;
            });
        }

        if (req.body.zip_code.length != 5) {
            res.status(400);
            throw new Error("รหัสไปรษณีย์ไม่ถูกต้อง");
        }
        
        Object.assign(tax, req.body);
        await user.save();
        res.json({
            tax_info: user.tax_info
        });
    } else {
        res.status(400);
        throw new Error("ข้อมูลไม่ถูกต้อง");
    }
});

// @desc    Delete Tax
// @route   Delete /api/address/tax/:id
// @access  Private
const deleteTax = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);
    const tax = user.tax_info.id(req.params.id);

    if (tax) {
        tax.deleteOne();
        await user.save();
        res.json({
            message: "ลบข้อมูลภาษีเรียบร้อย"
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบข้อมูลภาษี");
    }
});

export {
    addAddress,
    getAddress,
    updateAddress,
    deleteAddress,
    addTax,
    getTax,
    updateTax,
    deleteTax
}