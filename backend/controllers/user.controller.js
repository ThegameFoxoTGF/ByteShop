import asyncHandler from "../middleware/asynchandler.js";
import generateToken from "../utils/generatetoken.js";
import User from "../models/user.model.js";

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
        });
    } else {
        res.status(401);
        throw new Error("อีเมล หรือ รหัสผ่านไม่ถูกต้อง");
    }
});

const registerUser = asyncHandler(async (req, res) => {
    const { first_name, last_name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error("อีเมลนี้ถูกใช้แล้ว");
    }

    const user = await User.create({
        profile: {
            first_name,
            last_name,
        },
        email,
        password,
    });

    if (user) {
        generateToken(res, user._id);
        res.status(201).json({
            _id: user._id,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error("ข้อมูลผู้ใช้ไม่ถูกต้อง");
    }
});

const logoutUser = (req, res) => {
    res.clearCookie("token");
    res.status(200).json({ message: "ออกจากระบบเรียบร้อย" });
};

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {
        res.json({
            _id: user._id,
            first_name: user.profile.first_name,
            last_name: user.profile.last_name,
            birthday: user.profile.birthday,
            phone: user.profile.phone,
            email: user.email,
        });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});


const updateUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (user) {


    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

const getUsers = asyncHandler(async (req, res) => {
    const users = await User.find({});
    res.json(users);
});

const deleteUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.role === "admin" || user.role === "staff") {
            res.status(400);
            throw new Error("ไม่สามารถลบผู้ใช้ประเภท admin หรือ staff ได้");
        }
        await User.deleteOne({ _id: user._id });
        res.json({ message: "ลบผู้ใช้เรียบร้อย" });
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

const getUserById = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password");

    if (user) {
        res.json(user);
    } else {
        res.status(404);
        throw new Error("ไม่พบผู้ใช้");
    }
});

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.profile.first_name = req.body.first_name || user.profile.first_name;
        user.profile.last_name = req.body.last_name || user.profile.last_name;
        user.email = req.body.email || user.email;
        user.role = req.body.role || user.role;

        if (req.body.password) {
            user.password = req.body.password;
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            first_name: updatedUser.profile.first_name,
            last_name: updatedUser.profile.last_name,
            email: updatedUser.email,
            role: updatedUser.role,
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
}