import express from "express";

import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { createUser, getUserById, getUsers, updateUser } from "../../controller/user/user.controller.js";

const router = express.Router();

router.post(
    "/",
    authMiddleware,
    allowRoles("ADMIN"),
    createUser
);
router.get(
    "/",
    authMiddleware,
    allowRoles("ADMIN"),
    getUsers
);
router.get(
    "/:id",
    authMiddleware,
    allowRoles("ADMIN"),
    getUserById
);
router.patch(
    "/:id",
    authMiddleware,
    allowRoles("ADMIN"),
    updateUser
);

export default router;