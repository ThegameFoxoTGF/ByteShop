import asyncHandler from "../middleware/asyncHandler.js";
import generateToken from "../utils/generatetoken.js";
import User from "../models/user.model.js";
import { generateOtp, generatePasswordToken, otpTemplate } from "../utils/generateotp.js";
import sendEmail from "../utils/sendemail.js";

const processOtp = async (email) => {
    const otp = generateOtp();
    const otphtml = otpTemplate(otp);
    const options = {
        to: email,
        subject: "ByteShop OTP",
        html: otphtml,
    };
    await sendEmail(options);
    return otp;
}

// @desc    Send OTP
// @route   POST /api/user/otp
// @access  Public
const sendOtp = asyncHandler(async (req, res) => {
    const email = req.body.email || (req.user && req.user.email);
    const user = await User.findOne({ email });

    if (!email) {
        res.status(400);
        throw new Error("อีเมลไม่ถูกต้อง");
    }

    if (user) {

        const otp = await processOtp(user.email);

        user.otp = {
            otp_code: otp,
            otp_expires: Date.now() + 5 * 60 * 1000,
        };

        await user.save();
        res.json({ message: "ขอ OTP เรียบร้อย", sentTo: email });
    } else {
        res.status(400);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Auth user & get token
// @route   POST /api/user/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (user && (await user.matchPassword(password))) {

        generateToken(res, user._id);
        res.status(200).json({
            _id: user._id,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            email: user.email,
            is_admin: user.is_admin,
        });
    } else {
        res.status(401);
        throw new Error("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
    }
});

// @desc    Register new user
// @route   POST /api/user/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("ข้อมูลไม่ครบถ้วน");
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        res.status(400);
        throw new Error("อีเมลนี้ถูกใช้แล้ว");
    }

    const user = await User.create({
        email,
        password,
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error("ข้อมูลผู้ใช้ไม่ถูกต้อง");
    }
});

// @desc    Logout user
// @route   POST /api/user/logout
// @access  Private
const logoutUser = (req, res) => {
    res.clearCookie("jwt");
    res.status(200).json({ message: "ออกจากระบบเรียบร้อย" });
};

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            email: user.email,
            profile: user.profile,
            is_admin: user.is_admin,
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        user.profile.first_name = req.body.first_name || user.profile.first_name;
        user.profile.last_name = req.body.last_name || user.profile.last_name;
        user.profile.phone = req.body.phone || user.profile.phone;
        user.profile.birthday = req.body.birthday || user.profile.birthday;
        user.email = req.body.email || user.email;

        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            profile: updatedUser.profile,
            email: updatedUser.email,
        });

    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Forgot password
// @route   POST /api/user/forgot
// @access  Public
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (user) {

        const otp = await processOtp(user.email);

        user.otp = {
            otp_code: otp,
            otp_expires: Date.now() + 5 * 60 * 1000,
        };

        await user.save();
        res.json({ message: "ขอ OTP เรียบร้อย", sentTo: email, type: "forgot" });
    } else {
        res.status(400);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Verify OTP
// @route   POST /api/user/verify
// @access  Public
const verifyOtp = asyncHandler(async (req, res) => {
    const { email, otp, type } = req.body;
    let responseData = {};
    const user = await User.findOne({ email });
    if (user) {
        if (user.otp.otp_code !== otp) {
            res.status(400);
            throw new Error("OTP ไม่ถูกต้อง");
        }
        if (user.otp.otp_expires < Date.now()) {
            res.status(400);
            throw new Error("OTP หมดอายุ กรุณาขอ OTP อีกครั้ง");
        }

        if (type === "forgot") {
            const passwordToken = generatePasswordToken();
            user.passwordToken = passwordToken;
            user.passwordTokenExpires = Date.now() + 5 * 60 * 1000;
            responseData.passwordToken = passwordToken;
        }

        user.otp = {
            otp_code: null,
            otp_expires: null,
        };
        await user.save();
        res.json({ message: "ยืนยัน OTP เรียบร้อย", responseData });
    } else {
        res.status(400);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Reset password
// @route   POST /api/user/forgot-reset
// @access  Public
const resetPassword = asyncHandler(async (req, res) => {
    const { email, newPassword, passwordToken } = req.body;
    const user = await User.findOne({ email, passwordToken, passwordTokenExpires: { $gt: Date.now() } });
    if (user) {
        user.password = newPassword;
        user.passwordToken = undefined;
        user.passwordTokenExpires = undefined;
        await user.save();
        res.json({ message: "เปลี่ยนรหัสผ่านเรียบร้อย" });
    } else {
        res.status(400);
        throw new Error("รหัสยืนยันไม่ถูกต้องหรือหมดอายุแล้ว กรุณาเริ่มขั้นตอนใหม่อีกครั้ง");
    }
});

// @desc    Get all users
// @route   GET /api/user
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({}).sort({ name: 1 });
    res.json(users);
});

// @desc    Get user by ID
// @route   GET /api/user/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Delete user
// @route   DELETE /api/user/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.is_admin) {
            res.status(400);
            throw new Error("ไม่สามารถลบผู้ใช้ที่เป็น admin ได้");
        }
        await User.deleteOne({ _id: user._id });
        res.json({ message: "ลบผู้ใช้เรียบร้อย" });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

// @desc    Update user
// @route   PUT /api/user/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.profile.first_name = req.body.first_name || user.profile.first_name;
        user.profile.last_name = req.body.last_name || user.profile.last_name;
        user.email = req.body.email || user.email;
        user.is_admin = req.body.is_admin !== undefined ? req.body.is_admin : user.is_admin;

        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            first_name: updatedUser.profile.first_name,
            last_name: updatedUser.profile.last_name,
            email: updatedUser.email,
            is_admin: updatedUser.is_admin,
        });

    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

export {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
    sendOtp,
    forgotPassword,
    verifyOtp,
    resetPassword,
}

