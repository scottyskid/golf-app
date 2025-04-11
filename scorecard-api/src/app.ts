import cors from "cors";
import express from "express";
import morgan from "morgan";

import prisma from "./db";
import { errorHandler } from "./middlewares/errorHandler";
import scorecardRoutes from "./routes/scorecardRoutes";

const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(morgan("dev"));

// Health check endpoint
app.get("/health", (_req, res): void => {
    res.json({ status: "OK" });
});

// API routes
app.use("/api/v1/scorecard", scorecardRoutes);

// Error handler
app.use(errorHandler);

// Connect to database on startup
const connectDB = async (): Promise<void> => {
    try {
        await prisma.$connect();
        console.log("Database connected");
    } catch (error) {
        console.error("Failed to connect to database:", error);
        process.exit(1);
    }
};

connectDB();

export { app };
