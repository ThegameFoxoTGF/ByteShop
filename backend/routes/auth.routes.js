import express from "express";
import { protect } from "../middleware/auth.middleware.js";

import { signup, signin, getUserProfile } from "../controllers/auth.controller.js";

const router = express.Router();

router.post('/signup', signup);
router.post('/signin', signin);
router.get('/profile', protect, getUserProfile);

export default router;