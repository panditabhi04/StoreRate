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

router.use(authMiddleware, allowRoles("ADMIN"));

router.post("/", allowRoles("ADMIN"), authMiddleware, createAdmin);
router.post("/users", allowRoles("ADMIN"), authMiddleware, createAdmin);

router.get("/", allowRoles("ADMIN"), authMiddleware, getAdmins);
router.get("/users", allowRoles("ADMIN"), authMiddleware, getAdmins);

router.get("/:id", allowRoles("ADMIN"), authMiddleware, getAdminById);

router.patch("/:id", allowRoles("ADMIN"), authMiddleware, updateAdmin);

export default router;
