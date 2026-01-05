import multer from "multer";
import express from "express";
import { uploadImage } from "../controllers/upload.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 1024 * 1024 * 2
    }

})

const uploadMiddleware = (req, res, next) => {
    upload.single('image')(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }
        next();
    });
};

router.route("/").post(protect, admin, uploadMiddleware, uploadImage);

export default router;
