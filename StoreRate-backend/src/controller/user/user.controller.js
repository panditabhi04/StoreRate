import {
    createUserService,
    getUsersService,
    getUserByIdService,
    updateUserService
} from "../../services/user/user.service.js";

import {
    createUserSchema,
    updateUserSchema
} from "../../validator/user.validator.js";

export const createUser = async (req, res) => {

    try {
        console.log("REQ BODY:", req.body);
        console.log("--------------validation iiiii --------------------");

        const validation = createUserSchema.safeParse(req.body);
        console.log("validation : ", validation);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await createUserService(
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: result
        });

    } catch (error) {

        console.error("Create User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUsers = async (req, res) => {
    try {

        const {
            name,
            email,
            address,
            role
        } = req.query;

        const users = await getUsersService({
            name,
            email,
            address,
            role
        });

        return res.status(200).json({
            success: true,
            data: users
        });

    } catch (error) {

        console.error("Get Users Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getUserById = async (req, res) => {

    try {

        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const user = await getUserByIdService(userId);

        return res.status(200).json({
            success: true,
            data: user
        });

    } catch (error) {

        console.error("Get User By ID Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateUser = async (req, res) => {

    try {

        const userId = Number(req.params.id);

        if (!Number.isInteger(userId) || userId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid user ID"
            });
        }

        const validation = updateUserSchema.safeParse(
            req.body
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await updateUserService(
            userId,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "User updated successfully",
            data: result
        });

    } catch (error) {

        console.error("Update User Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};