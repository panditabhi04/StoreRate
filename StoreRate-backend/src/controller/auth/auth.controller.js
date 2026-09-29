import {
    registerUserService,
    loginUserService,
    changePasswordService
} from "../../services/auth/auth.service.js";
import { registerUserSchema } from "../../validator/auth.validator.js";

export const registerUser = async (req, res) => {
    try {
        const validation = registerUserSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await registerUserService(validation.data);

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            data: result
        });

    } catch (error) {
        console.error("Register User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        const result = await loginUserService(
            email,
            password
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            data: result
        });

    } catch (error) {
        console.error("Login Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const logoutUser = async (req, res) => {
    try {
        return res.status(200).json({
            success: true,
            message: "Logout successful"
        });
    } catch (error) {
        console.error("Logout Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const changePassword = async (req, res) => {
    try {

        console.log("REQ BODY:", req.body);
        console.log("REQ USER:", req.user);

        const {
            currentPassword,
            newPassword
        } = req.body || {};

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Current password and new password are required"
            });
        }

        const result = await changePasswordService(
            req.user.id,
            currentPassword,
            newPassword
        );

        return res.status(200).json({
            success: true,
            message: "Password changed successfully",
            data: result
        });

    } catch (error) {

        console.error("Change Password Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
