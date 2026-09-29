import express from "express";
import authRouter from "../route/auth/auth.routes.js"
import storeRouter from "../route/stores/store.routes.js"
import newUserRouter from "../route/NewUser/NewUser.route.js"
import dashboardRouter from "../route/dashboard/dashboard.route.js"
import ratingRouter from "../route/rating/rating.route.js"
import adminRouter from "../route/admin/admin.route.js"
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log("auth route in index.js");

app.use("/auth", authRouter);
app.use("/stores", storeRouter);
app.use("/new-user", newUserRouter);
app.use("/dashboard", dashboardRouter);
app.use("/rating", ratingRouter);
app.use("/admin", adminRouter);

export default app;