import {
    getDashboardService,
    getOwnerDashboardService
} from "../../services/dashboard/dashboard.service.js";

export const getDashboard = async (req, res) => {

    try {

        const dashboard = await getDashboardService();

        return res.status(200).json({
            success: true,
            data: dashboard
        });

    } catch (error) {

        console.error("Dashboard Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getOwnerDashboard = async (req, res) => {

    try {

        const ownerId = req.user.id;

        const dashboard = await getOwnerDashboardService(ownerId);

        return res.status(200).json({
            success: true,
            message: "Owner dashboard fetched successfully",
            data: dashboard
        });

    } catch (error) {

        console.error("Owner Dashboard Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};