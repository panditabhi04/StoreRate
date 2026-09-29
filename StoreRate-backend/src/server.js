import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import apiRouter from "./route/index.js"

import { DbConnection } from "./config/db.js";
const router = express.Router();

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("server.js");

app.use("/api", apiRouter)

app.listen(PORT, async () => {
    await DbConnection();
    console.log(`Server running at http://localhost:${PORT}`);
});

export default app;