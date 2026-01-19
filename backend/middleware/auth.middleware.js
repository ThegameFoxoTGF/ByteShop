import asyncHandler from "./asyncHandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = asyncHandler(async (req, res, next) => {
    let token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.userId).select("-password");
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error("ไม่ได้รับอนุญาต โทเค็นไม่ถูกต้อง");
        }
    } else {
        res.status(401);
        throw new Error("ไม่ได้รับอนุญาต ไม่มีโทเค็น");
    }
})

const admin = (req, res, next) => {
    if (req.user.is_admin) {
        next();
    } else {
        res.status(401);
        throw new Error("ไม่ได้รับอนุญาต ไม่มีสิทธิ์");
    }
}

export { protect, admin };