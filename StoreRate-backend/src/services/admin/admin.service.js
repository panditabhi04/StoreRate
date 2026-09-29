import bcrypt from "bcryptjs";
import DbConnection from "../../config/db.js";

export const createAdminService = async ({
    name,
    email,
    password,
    address,
    role = "ADMIN"
}) => {
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

    const hashedPassword = await bcrypt.hash(password, 10);

    const adminRole = "ADMIN";

    const [result] = await DbConnection.execute(
        `INSERT INTO users
        (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?)`,
        [
            name,
            email,
            hashedPassword,
            address,
            adminRole
        ]
    );

    return {
        id: result.insertId,
        name,
        email,
        address,
        role: adminRole
    };
};

export const getAdminsService = async ({
    name,
    email,
    address,
    role = "ADMIN",
    search
} = {}) => {
    let query = `
        SELECT
            id,
            name,
            email,
            address,
            role,
            created_at,
            updated_at
        FROM users
        WHERE 1 = 1
    `;

    const values = [];

    if (role && role !== "ALL") {
        query += ` AND role = ?`;
        values.push(role);
    }

    if (search) {
        query += ` AND (name LIKE ? OR email LIKE ? OR address LIKE ?)`;
        values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (name) {
        query += ` AND name LIKE ?`;
        values.push(`%${name}%`);
    }

    if (email) {
        query += ` AND email LIKE ?`;
        values.push(`%${email}%`);
    }

    if (address) {
        query += ` AND address LIKE ?`;
        values.push(`%${address}%`);
    }

    query += ` ORDER BY id DESC`;

    const [admins] = await DbConnection.execute(query, values);

    return admins;
};

export const getAdminByIdService = async (adminId) => {
    const [users] = await DbConnection.execute(
        `SELECT
            id,
            name,
            email,
            address,
            role,
            created_at,
            updated_at
         FROM users
         WHERE id = ? AND role = 'ADMIN'`,
        [adminId]
    );

    if (users.length === 0) {
        const error = new Error("Admin user not found");
        error.statusCode = 404;
        throw error;
    }

    return users[0];
};

export const updateAdminService = async (adminId, data) => {
    const [existing] = await DbConnection.execute(
        `SELECT id
         FROM users
         WHERE id = ? AND role = 'ADMIN'`,
        [adminId]
    );

    if (existing.length === 0) {
        const error = new Error("Admin user not found");
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
        const [duplicateUsers] = await DbConnection.execute(
            `SELECT id
             FROM users
             WHERE email = ? AND id != ?`,
            [data.email, adminId]
        );

        if (duplicateUsers.length > 0) {
            const error = new Error("Email already registered");
            error.statusCode = 409;
            throw error;
        }

        fields.push("email = ?");
        values.push(data.email);
    }

    if (data.password !== undefined) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        fields.push("password = ?");
        values.push(hashedPassword);
    }

    if (data.address !== undefined) {
        fields.push("address = ?");
        values.push(data.address);
    }

    if (fields.length === 0) {
        const error = new Error("No fields provided for update");
        error.statusCode = 400;
        throw error;
    }

    values.push(adminId);

    await DbConnection.execute(
        `UPDATE users
         SET ${fields.join(", ")}
         WHERE id = ?`,
        values
    );

    return await getAdminByIdService(adminId);
};
