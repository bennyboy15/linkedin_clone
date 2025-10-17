import express from "express";
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js"
import userRoutes from "./routes/user.route.js"
import {connectDB} from "./lib/db.js"
import cookieParser from "cookie-parser";

const app = express();
config();

app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());
const PORT = process.env.PORT || 5000;

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);

app.listen(PORT, () => {
    console.log("Server listening @ port", PORT);
    connectDB();
});