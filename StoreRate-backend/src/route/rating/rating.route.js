import express from "express";



import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";
import { submitRating, updateRating } from "../../controller/stores/store.controller.js";

const router = express.Router();


// Submit rating
router.post(
    "/",
    authMiddleware,
    allowRoles("USER"),
    submitRating
);


// Modify rating
router.patch(
    "/:storeId",
    authMiddleware,
    allowRoles("USER", "ADMIN", "OWNER"),
    updateRating
);

export default router;