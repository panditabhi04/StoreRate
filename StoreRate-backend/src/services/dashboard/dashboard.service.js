import DbConnection from "../../config/db.js";

export const getDashboardService = async () => {

    const [users] = await DbConnection.execute(
        `SELECT COUNT(*) AS total_users
         FROM users`
    );

    const [stores] = await DbConnection.execute(
        `SELECT COUNT(*) AS total_stores
         FROM stores`
    );

    const [ratings] = await DbConnection.execute(
        `SELECT COUNT(*) AS total_ratings
         FROM ratings`
    );

    return {
        total_users: users[0].total_users,
        total_stores: stores[0].total_stores,
        total_ratings: ratings[0].total_ratings
    };
};

export const getOwnerDashboardService = async (ownerId) => {

    // Find owner's store
    const [stores] = await DbConnection.execute(
        `
        SELECT id, name
        FROM stores
        WHERE owner_id = ?
        `,
        [ownerId]
    );

    if (stores.length === 0) {

        const error = new Error(
            "No store found for this owner"
        );

        error.statusCode = 404;

        throw error;
    }

    const store = stores[0];


    // Get average rating
    const [ratingResult] = await DbConnection.execute(
        `
        SELECT
            COALESCE(
                ROUND(AVG(rating), 2),
                0
            ) AS average_rating
        FROM ratings
        WHERE store_id = ?
        `,
        [store.id]
    );


    // Get users who submitted ratings
    const [users] = await DbConnection.execute(
        `
        SELECT
            u.id AS user_id,
            u.name AS user_name,
            u.email,
            r.rating,
            r.created_at
        FROM ratings r
        INNER JOIN users u
            ON r.user_id = u.id
        WHERE r.store_id = ?
        ORDER BY r.created_at DESC
        `,
        [store.id]
    );


    return {
        store: {
            id: store.id,
            name: store.name
        },

        average_rating: ratingResult[0].average_rating,

        users: users
    };
};