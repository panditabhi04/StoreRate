import DbConnection from "../../config/db.js";

export const createStoreService = async ({
    name,
    email,
    address,
    owner_id
}) => {

    const [owner] = await DbConnection.execute(
        `SELECT id, role
         FROM users
         WHERE id = ?`,
        [owner_id]
    );

    if (owner.length === 0) {
        const error = new Error("Store owner not found");
        error.statusCode = 404;
        throw error;
    }

    if (owner[0].role !== "OWNER") {
        const error = new Error(
            "Selected user is not a store owner"
        );
        error.statusCode = 400;
        throw error;
    }

    const [result] = await DbConnection.execute(
        `INSERT INTO stores
        (name, email, address, owner_id)
        VALUES (?, ?, ?, ?)`,
        [
            name,
            email,
            address,
            owner_id
        ]
    );

    return {
        id: result.insertId,
        name,
        email,
        address,
        owner_id
    };
};

export const getStoresService = async () => {

    const [stores] = await DbConnection.execute(
        `SELECT
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name AS owner_name,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
            s.created_at,
            s.updated_at
        FROM stores s

        LEFT JOIN users u
            ON s.owner_id = u.id

        LEFT JOIN ratings r
            ON s.id = r.store_id

        GROUP BY
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name,
            s.created_at,
            s.updated_at

        ORDER BY s.id DESC`
    );

    return stores;
};

export const getStoreByIdService = async (id) => {

    const [stores] = await DbConnection.execute(
        `SELECT
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name AS owner_name,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
            s.created_at,
            s.updated_at
        FROM stores s

        LEFT JOIN users u
            ON s.owner_id = u.id

        LEFT JOIN ratings r
            ON s.id = r.store_id

        WHERE s.id = ?

        GROUP BY
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name,
            s.created_at,
            s.updated_at`,
        [id]
    );

    if (stores.length === 0) {
        const error = new Error("Store not found");
        error.statusCode = 404;
        throw error;
    }

    return stores[0];
};

export const updateStoreService = async (id, data) => {

    const {
        name,
        email,
        address,
        owner_id
    } = data;

    const [existingStore] = await DbConnection.execute(
        "SELECT id FROM stores WHERE id = ?",
        [id]
    );

    if (existingStore.length === 0) {
        const error = new Error("Store not found");
        error.statusCode = 404;
        throw error;
    }

    if (owner_id !== undefined) {

        const [owner] = await DbConnection.execute(
            `SELECT id, role
             FROM users
             WHERE id = ?`,
            [owner_id]
        );

        if (owner.length === 0) {
            const error = new Error("Store owner not found");
            error.statusCode = 404;
            throw error;
        }

        if (owner[0].role !== "OWNER") {
            const error = new Error(
                "Selected user is not a store owner"
            );

            error.statusCode = 400;
            throw error;
        }
    }

    const fields = [];
    const values = [];

    if (name !== undefined) {
        fields.push("name = ?");
        values.push(name);
    }

    if (email !== undefined) {
        fields.push("email = ?");
        values.push(email);
    }

    if (address !== undefined) {
        fields.push("address = ?");
        values.push(address);
    }

    if (owner_id !== undefined) {
        fields.push("owner_id = ?");
        values.push(owner_id);
    }

    if (fields.length === 0) {
        const error = new Error(
            "At least one field is required for update"
        );

        error.statusCode = 400;
        throw error;
    }

    values.push(id);

    await DbConnection.execute(
        `UPDATE stores
         SET ${fields.join(", ")}
         WHERE id = ?`,
        values
    );

    return getStoreByIdService(id);
};

export const deleteStoreService = async (id) => {

    const [existingStore] = await DbConnection.execute(
        "SELECT id FROM stores WHERE id = ?",
        [id]
    );

    if (existingStore.length === 0) {
        const error = new Error("Store not found");
        error.statusCode = 404;
        throw error;
    }

    await DbConnection.execute(
        "DELETE FROM stores WHERE id = ?",
        [id]
    );

    return {
        id,
        message: "Store deleted successfully"
    };
};

export const searchStoresService = async ({ name, address }) => {

    let query = `
        SELECT
            s.id,
            s.name,
            s.address,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS overall_rating
        FROM stores s
        LEFT JOIN ratings r
            ON s.id = r.store_id
        WHERE 1 = 1
    `;

    const values = [];

    if (name) {
        query += ` AND s.name LIKE ?`;
        values.push(`%${name}%`);
    }

    if (address) {
        query += ` AND s.address LIKE ?`;
        values.push(`%${address}%`);
    }

    query += `
        GROUP BY
            s.id,
            s.name,
            s.address
        ORDER BY s.id DESC
    `;

    const [stores] = await DbConnection.execute(
        query,
        values
    );

    return stores;
};

export const submitRatingService = async (
    userId,
    storeId,
    rating
) => {

    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {

        const error = new Error(
            "Rating must be an integer between 1 and 5"
        );

        error.statusCode = 400;
        throw error;
    }

    const [stores] = await DbConnection.execute(
        `
        SELECT id
        FROM stores
        WHERE id = ?
        `,
        [storeId]
    );

    if (stores.length === 0) {

        const error = new Error("Store not found");

        error.statusCode = 404;
        throw error;
    }


    // Check whether user already submitted rating
    const [existingRating] = await DbConnection.execute(
        `
        SELECT id, rating
        FROM ratings
        WHERE user_id = ?
        AND store_id = ?
        `,
        [userId, storeId]
    );

    if (existingRating.length > 0) {

        const error = new Error(
            "You have already submitted a rating for this store"
        );

        error.statusCode = 409;
        throw error;
    }


    // Insert rating
    const [result] = await DbConnection.execute(
        `
        INSERT INTO ratings
        (
            user_id,
            store_id,
            rating
        )
        VALUES (?, ?, ?)
        `,
        [
            userId,
            storeId,
            Number(rating)
        ]
    );


    return {
        id: result.insertId,
        user_id: userId,
        store_id: Number(storeId),
        rating: Number(rating)
    };
};

export const updateRatingService = async (
    userId,
    storeId,
    rating
) => {

    if (!Number.isInteger(Number(rating)) || rating < 1 || rating > 5) {

        const error = new Error(
            "Rating must be an integer between 1 and 5"
        );

        error.statusCode = 400;
        throw error;
    }

    const [ratingById] = await DbConnection.execute(
        `
        SELECT id, user_id, store_id, rating
        FROM ratings
        WHERE id = ?
        `,
        [Number(storeId)]
    );

    if (ratingById.length > 0) {
        await DbConnection.execute(
            `
            UPDATE ratings
            SET rating = ?
            WHERE id = ?
            `,
            [
                Number(rating),
                Number(storeId)
            ]
        );

        return {
            id: Number(storeId),
            user_id: ratingById[0].user_id,
            store_id: ratingById[0].store_id,
            rating: Number(rating)
        };
    }

    const [existingRating] = await DbConnection.execute(
        `
        SELECT id, store_id, rating
        FROM ratings
        WHERE user_id = ?
        AND store_id = ?
        `,
        [userId, Number(storeId)]
    );

    if (existingRating.length > 0) {
        const matchedRatingId = existingRating[0].id;
        await DbConnection.execute(
            `
            UPDATE ratings
            SET rating = ?
            WHERE id = ?
            `,
            [
                Number(rating),
                matchedRatingId
            ]
        );

        return {
            id: matchedRatingId,
            user_id: userId,
            store_id: Number(storeId),
            rating: Number(rating)
        };
    }

    const [stores] = await DbConnection.execute(
        `
        SELECT id, owner_id
        FROM stores
        WHERE id = ?
        `,
        [Number(storeId)]
    );

    if (stores.length > 0) {
        const [result] = await DbConnection.execute(
            `
            INSERT INTO ratings (user_id, store_id, rating)
            VALUES (?, ?, ?)
            `,
            [
                userId,
                Number(storeId),
                Number(rating)
            ]
        );

        return {
            id: result.insertId,
            user_id: userId,
            store_id: Number(storeId),
            rating: Number(rating)
        };
    }

    const error = new Error(
        "Rating record or store not found"
    );
    error.statusCode = 404;
    throw error;
};

export const getOwnerStoresService = async (ownerId) => {
    const [stores] = await DbConnection.execute(
        `SELECT
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name AS owner_name,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS average_rating,
            COALESCE(ROUND(AVG(r.rating), 2), 0) AS overall_rating,
            COUNT(DISTINCT r.id) AS total_ratings,
            s.created_at,
            s.updated_at
        FROM stores s

        LEFT JOIN users u
            ON s.owner_id = u.id

        LEFT JOIN ratings r
            ON s.id = r.store_id

        WHERE s.owner_id = ?

        GROUP BY
            s.id,
            s.name,
            s.email,
            s.address,
            s.owner_id,
            u.name,
            s.created_at,
            s.updated_at

        ORDER BY s.id DESC`,
        [ownerId]
    );

    return stores;
};