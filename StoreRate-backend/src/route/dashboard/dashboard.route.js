import express from "express";

import {
    getDashboard,
    getOwnerDashboard
} from "../../controller/dashboard/dashboard.controller.js";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/",
    authMiddleware,
    allowRoles("ADMIN"),
    getDashboard
);

// Owner Dashboard
router.get(
    "/owner",
    authMiddleware,
    allowRoles("OWNER"),
    getOwnerDashboard
);

export default router;