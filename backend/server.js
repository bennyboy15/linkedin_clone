import express from "express";
import { config } from "dotenv";
import authRoutes from "./routes/auth.route.js"
import {connectDB} from "./lib/db.js"

const app = express();
config();

app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use("/api/v1/auth", authRoutes);

app.listen(PORT, () => {
    console.log("Server listening @ port", PORT);
    connectDB();
});