import express from "express";
import {
    authUser,
    registerUser,
    logoutUser,
    getUserProfile,
    updateUserProfile,
    getUsers,
    deleteUser,
    getUserById,
    updateUser,
} from "../controllers/user.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

router.route("/").get(protect, admin, getUsers);

router.route("/register").post(registerUser)
router.route("/login").post(authUser)
router.route("/logout").post(logoutUser)

router
    .route("/profile")
    .get(protect, )
    .put(protect, );
router
    .route("/:id")
    .delete(protect, admin, )
    .get(protect, admin, )
    .put(protect, admin, );

export default router;
