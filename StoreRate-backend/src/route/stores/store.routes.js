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

// Dedicated route for Store Owner: view ONLY their own store
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

// View stores:
// - If logged-in user is an OWNER: automatically runs getOwnerStores (sees ONLY their store)
// - If logged-in user is ADMIN or USER: runs existing getStores as before
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

// Only ADMIN and OWNER can create
router.post(
    "/",
    authMiddleware,
    allowRoles("ADMIN", "OWNER"),
    createStore
);


// Only ADMIN and OWNER can update
router.patch(
    "/:id",
    authMiddleware,
    allowRoles("ADMIN", "OWNER"),
    updateStore
);

// Submit rating
router.post(
    "/",
    authMiddleware,
    allowRoles("USER"),
    submitRating
);


// Modify submitted rating
router.patch(
    "/:storeId",
    authMiddleware,
    allowRoles("USER"),
    updateRating

);

// Only ADMIN can delete
router.delete(
    "/:id",
    authMiddleware,
    allowRoles("ADMIN"),
    deleteStore
);

export default router;