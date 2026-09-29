import express from "express";
import { loginUser, registerUser, logoutUser, changePassword } from "../../controller/auth/auth.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { allowRoles } from "../../middleware/role.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
console.log("Auth route");

router.patch(
    "/change-password",
    authMiddleware,
    allowRoles("USER", "OWNER"),
    changePassword
);

export default router;