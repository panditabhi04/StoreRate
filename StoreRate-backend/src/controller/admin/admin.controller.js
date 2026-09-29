import {
    createAdminService,
    getAdminsService,
    getAdminByIdService,
    updateAdminService
} from "../../services/admin/admin.service.js";

import {
    createAdminSchema,
    updateAdminSchema
} from "../../validator/admin.validator.js";

export const createAdmin = async (req, res) => {
    try {
        console.log("REQ BODY (createAdmin):", req.body);

        if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing or empty. Please ensure you are sending a JSON body with 'Content-Type: application/json' header."
            });
        }

        const validation = createAdminSchema.safeParse(req.body || {});

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await createAdminService(validation.data);

        return res.status(201).json({
            success: true,
            message: "Admin user created successfully",
            data: result
        });
    } catch (error) {
        console.error("Create Admin Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getAdmins = async (req, res) => {
    try {
        const {
            name,
            email,
            address,
            role,
            search
        } = req.query;

        const admins = await getAdminsService({
            name,
            email,
            address,
            role,
            search
        });

        return res.status(200).json({
            success: true,
            message: "Admin users fetched successfully",
            data: admins
        });
    } catch (error) {
        console.error("Get Admins Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getAdminById = async (req, res) => {
    try {
        const adminId = Number(req.params.id);

        if (!Number.isInteger(adminId) || adminId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID"
            });
        }

        const admin = await getAdminByIdService(adminId);

        return res.status(200).json({
            success: true,
            data: admin
        });
    } catch (error) {
        console.error("Get Admin By ID Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const adminId = Number(req.params.id);

        if (!Number.isInteger(adminId) || adminId <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid admin ID"
            });
        }

        if (!req.body || typeof req.body !== "object" || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                success: false,
                message: "Request body is missing or empty. Please ensure you are sending a JSON body with 'Content-Type: application/json' header."
            });
        }

        const validation = updateAdminSchema.safeParse(req.body || {});

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await updateAdminService(adminId, validation.data);

        return res.status(200).json({
            success: true,
            message: "Admin user updated successfully",
            data: result
        });
    } catch (error) {
        console.error("Update Admin Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};
