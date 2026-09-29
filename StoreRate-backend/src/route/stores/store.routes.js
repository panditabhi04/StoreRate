import express from "express";

import {
    createStore,
    getStores,
    getStoreById,
    updateStore,
    deleteStore,
    searchStores,
    submitRating,
    updateRating,
    getOwnerStores
} from "../../controller/stores/store.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";

const router = express.Router();

router.get(
    "/owner",
    authMiddleware,
    allowRoles("OWNER"),
    getOwnerStores
);

router.get(
    "/my-store",
    authMiddleware,
    allowRoles("OWNER"),
    getOwnerStores
);

router.get(
    "/",
    authMiddleware,
    (req, res, next) => {
        if (req.user?.role === "OWNER") {
            return getOwnerStores(req, res);
        }
        next();
    },
    allowRoles("ADMIN", "USER"),
    getStores
);

router.get(
    "/search",
    authMiddleware,
    allowRoles("USER"),
    searchStores
);

router.get("/:id", authMiddleware, getStoreById);

router.post(
    "/",
    authMiddleware,
    allowRoles("ADMIN", "OWNER"),
    createStore
);

router.patch(
    "/:id",
    authMiddleware,
    allowRoles("ADMIN", "OWNER"),
    updateStore
);

router.post(
    "/",
    authMiddleware,
    allowRoles("USER"),
    submitRating
);

router.patch(
    "/:storeId",
    authMiddleware,
    allowRoles("USER"),
    updateRating

);

router.delete(
    "/:id",
    authMiddleware,
    allowRoles("ADMIN"),
    deleteStore
);

export default router;