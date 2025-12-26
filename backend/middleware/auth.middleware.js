import User from "../models/user.js";
import jwt from "jsonwebtoken";

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer"))
        try{
            token = req.headers.authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select("-password");
            return next();

        } catch (error) {
            console.error("Token verification failed",error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }

    return res.status(401).json({ message: "Not authorized, no token" });
}

const admin = (req, res, next) => {
    if (req.user && req.user.role === "admin") {
        return next();
    }
    return res.status(401).json({ message: `Not authorized as an admin`});
}

const employee = (req, res, next) => {
    if (req.user && (req.user.role === "admin" || req.user.role === "employee")) {
        return next();
    }
    return res.status(401).json({ message: "Not authorized as an employee" });
}

export { protect, admin, employee };