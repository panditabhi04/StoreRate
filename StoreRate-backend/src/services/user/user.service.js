import bcrypt from "bcryptjs";
import DbConnection from "../../config/db.js";

export const createUserService = async ({
    name,
    email,
    password,
    address,
}) => {

    // Check email
    const [existingUsers] = await DbConnection.execute(
        `SELECT id
         FROM users
         WHERE email = ?`,
        [email]
    );

    if (existingUsers.length > 0) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await DbConnection.execute(
        `INSERT INTO users
        (name, email, password, address)
        VALUES (?, ?, ?, ?)`,
        [
            name,
            email,
            hashedPassword,
            address,
        ]
    );

    return {
        id: result.insertId,
        name,
        email,
        address,
    };
};

export const getUsersService = async ({
    name,
    email,
    address,
    role
}) => {

    let query = `
        SELECT
            id,
            name,
            email,
            address,
            role
        FROM users
        WHERE 1 = 1
    `;

    const values = [];


    // Name filter
    if (name) {
        query += ` AND name LIKE ?`;
        values.push(`%${name}%`);
    }


    // Email filter
    if (email) {
        query += ` AND email LIKE ?`;
        values.push(`%${email}%`);
    }


    // Address filter
    if (address) {
        query += ` AND address LIKE ?`;
        values.push(`%${address}%`);
    }


    // Role filter
    if (role) {
        query += ` AND role = ?`;
        values.push(role);
    }


    query += ` ORDER BY id DESC`;


    const [users] = await DbConnection.execute(
        query,
        values
    );

    return users;
};

export const getUserByIdService = async (userId) => {

    const [users] = await DbConnection.execute(
        `SELECT
            id,
            name,
            email,
            address,
            created_at,
            updated_at
         FROM users
         WHERE id = ?`,
        [userId]
    );

    if (users.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    return users[0];
};

export const updateUserService = async (userId, data) => {

    // Check user
    const [users] = await DbConnection.execute(
        `SELECT id
         FROM users
         WHERE id = ?`,
        [userId]
    );

    if (users.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const fields = [];
    const values = [];


    if (data.name !== undefined) {
        fields.push("name = ?");
        values.push(data.name);
    }

    if (data.email !== undefined) {

        // Check duplicate email
        const [existingUsers] = await DbConnection.execute(
            `SELECT id
             FROM users
             WHERE email = ?
             AND id != ?`,
            [data.email, userId]
        );

        if (existingUsers.length > 0) {
            const error = new Error(
                "Email already registered"
            );

            error.statusCode = 409;
            throw error;
        }

        fields.push("email = ?");
        values.push(data.email);
    }

    if (data.password !== undefined) {

        const hashedPassword = await bcrypt.hash(
            data.password,
            10
        );

        fields.push("password = ?");
        values.push(hashedPassword);
    }

    if (data.address !== undefined) {
        fields.push("address = ?");
        values.push(data.address);
    }




    if (fields.length === 0) {
        const error = new Error(
            "No fields provided for update"
        );

        error.statusCode = 400;
        throw error;
    }


    values.push(userId);

    await DbConnection.execute(
        `UPDATE users
         SET ${fields.join(", ")}
         WHERE id = ?`,
        values
    );


    return await getUserByIdService(userId);
};