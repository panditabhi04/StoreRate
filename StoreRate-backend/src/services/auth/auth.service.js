import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import DbConnection from "../../config/db.js";

export const registerUserService = async (userData) => {
    const {
        name,
        email,
        password,
        address
    } = userData;

    const [existingUser] = await DbConnection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
    );

    if (existingUser.length > 0) {
        const error = new Error("Email already registered");
        error.statusCode = 409;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await DbConnection.execute(
        `INSERT INTO users
        (name, email, password, address, role)
        VALUES (?, ?, ?, ?, ?)`,
        [
            name,
            email,
            hashedPassword,
            address,
            "USER"
        ]
    );

    return {
        id: result.insertId,
        name,
        email,
        address,
        role: "USER"
    };
};

export const loginUserService = async (email, password) => {
    console.log("email : ", email);
    console.log("password : ", password);

    const [users] = await DbConnection.execute(
        `SELECT id, name, email, password, address, role
         FROM users
         WHERE email = ?`,
        [email]
    );

    console.log("users : ", users);

    if (users.length === 0) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const user = users[0];
    console.log("user : ", user);

    const passwords = "Password@123";

    const hash = await bcrypt.hash(password, 10);

    console.log(hash)
    const isPasswordValid = await bcrypt.compare(
        password,
        user.password
    );

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    const token = jwt.sign(
        {
            id: user.id,
            role: user.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );

    return {
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role
        }
    };
};

export const changePasswordService = async (
    userId,
    currentPassword,
    newPassword
) => {
    console.log("userId : ", userId);

    console.log("currentPassword serveries : ", currentPassword);
    console.log("newPasswordserives : ", newPassword);

    const [users] = await DbConnection.execute(
        `SELECT id, password
         FROM users
         WHERE id = ?`,
        [userId]
    );
    console.log("users : ", users);

    if (users.length === 0) {
        const error = new Error("User not found");
        error.statusCode = 404;
        throw error;
    }

    const user = users[0];

    const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.password
    );

    if (!isPasswordValid) {
        const error = new Error(
            "Current password is incorrect"
        );

        error.statusCode = 401;
        throw error;
    }

    const isSamePassword = await bcrypt.compare(
        newPassword,
        user.password
    );

    if (isSamePassword) {
        const error = new Error(
            "New password must be different from current password"
        );

        error.statusCode = 400;
        throw error;
    }

    const hashedPassword = await bcrypt.hash(
        newPassword,
        10
    );

    await DbConnection.execute(
        `UPDATE users
         SET password = ?
         WHERE id = ?`,
        [
            hashedPassword,
            userId
        ]
    );

    return {
        message: "Password changed successfully"
    };
};