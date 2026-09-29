import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import {
    createAdmin,
    getAdmins,
    getAdminById,
    updateAdmin
} from "../../controller/admin/admin.controller.js";

const router = express.Router();

// Only ADMIN can access all admin management endpoints
router.use(authMiddleware, allowRoles("ADMIN"));

// Add admin user
router.post("/", allowRoles("ADMIN"), authMiddleware, createAdmin);
router.post("/users", allowRoles("ADMIN"), authMiddleware, createAdmin);

// Show list of admin users
router.get("/", allowRoles("ADMIN"), authMiddleware, getAdmins);
router.get("/users", allowRoles("ADMIN"), authMiddleware, getAdmins);

// Get admin user by ID
router.get("/:id", allowRoles("ADMIN"), authMiddleware, getAdminById);

// Update admin user
router.patch("/:id", allowRoles("ADMIN"), authMiddleware, updateAdmin);

export default router;
