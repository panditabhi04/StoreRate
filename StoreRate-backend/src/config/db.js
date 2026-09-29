import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

const DbConnection = async () => {
    try {
        const connection = await db.getConnection();
        console.log("Database connected successfully");
        connection.release();
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};

export { DbConnection };
export default db;