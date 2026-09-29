import { createStoreService, deleteStoreService, getStoreByIdService, getStoresService, searchStoresService, submitRatingService, updateStoreService, updateRatingService, getOwnerStoresService } from "../../services/stores/store.service.js";
import { createStoreSchema, updateStoreSchema } from "../../validator/store.validator.js";



export const createStore = async (req, res) => {

    try {

        const validation = createStoreSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await createStoreService(
            validation.data
        );

        return res.status(201).json({
            success: true,
            message: "Store created successfully",
            data: result
        });

    } catch (error) {

        console.error("Create Store Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getStores = async (req, res) => {
    try {
        const stores = await getStoresService();
        return res.status(200).json({
            success: true,
            message: "Stores fetched successfully",
            data: stores
        });
    } catch (error) {
        console.error("Get Stores Error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

export const getStoreById = async (req, res) => {

    try {

        const { id } = req.params;

        const store = await getStoreByIdService(id);

        return res.status(200).json({
            success: true,
            message: "Store fetched successfully",
            data: store
        });

    } catch (error) {

        console.error("Get Store Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateStore = async (req, res) => {

    try {

        const { id } = req.params;

        const validation = updateStoreSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: validation.error.flatten().fieldErrors
            });
        }

        const result = await updateStoreService(
            id,
            validation.data
        );

        return res.status(200).json({
            success: true,
            message: "Store updated successfully",
            data: result
        });

    } catch (error) {

        console.error("Update Store Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const deleteStore = async (req, res) => {

    try {

        const { id } = req.params;

        const result = await deleteStoreService(id);

        return res.status(200).json({
            success: true,
            message: result.message,
            data: {
                id: result.id
            }
        });

    } catch (error) {

        console.error("Delete Store Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const searchStores = async (req, res) => {
    try {
        const { name, address } = req.query;

        if (!name && !address) {
            return res.status(400).json({
                success: false,
                message: "Please provide name or address to search"
            });
        }

        const stores = await searchStoresService({
            name,
            address
        });

        return res.status(200).json({
            success: true,
            data: stores
        });

    } catch (error) {
        console.error("Search Stores Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const submitRating = async (req, res) => {
    try {

        const { store_id, rating } = req.body;

        if (!store_id || rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Store ID and rating are required"
            });
        }

        const result = await submitRatingService(
            req.user.id,
            store_id,
            rating
        );

        return res.status(201).json({
            success: true,
            message: "Rating submitted successfully",
            data: result
        });

    } catch (error) {

        console.error("Submit Rating Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const updateRating = async (req, res) => {
    try {

        const { storeId } = req.params;
        const { rating } = req.body;

        if (rating === undefined) {
            return res.status(400).json({
                success: false,
                message: "Rating is required"
            });
        }

        const result = await updateRatingService(
            req.user.id,
            storeId,
            rating
        );

        return res.status(200).json({
            success: true,
            message: "Rating updated successfully",
            data: result
        });

    } catch (error) {

        console.error("Update Rating Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};

export const getOwnerStores = async (req, res) => {
    try {
        const ownerId = req.user.id;

        const stores = await getOwnerStoresService(ownerId);

        return res.status(200).json({
            success: true,
            message: "Owner store fetched successfully",
            data: stores
        });

    } catch (error) {
        console.error("Get Owner Stores Error:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Internal server error"
        });
    }
};