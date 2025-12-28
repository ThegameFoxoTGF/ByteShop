import asyncHandler from "./asynchandler.js";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const protect = asyncHandler(async (req, res, next) => {
    let token;

    token = req.cookies.jwt;

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            throw new Error("ไม่ได้รับอนุญาต โทเค็นไม่ถูกต้อง");
        }
    }else{
        res.status(401);
        throw new Error("ไม่ได้รับอนุญาต ไม่มีโทเค็น");
    }
})

const employee = (req, res, next) => {
    if (req.user && (req.user.role === "staff" || req.user.role === "admin")) {
        next();
    }else{
        res.status(401);
        throw new Error("ไม่ได้รับอนุญาต ไม่มีสิทธิ์")
    }
}

const admin = (req, res, next) => {
    if (req.user && (req.user.role === "admin")) {
        next();
    }else{
        res.status(401);
        throw new Error("ไม่ได้รับอนุญาต ไม่มีสิทธิ์")
    }
}

export { protect, employee, admin };