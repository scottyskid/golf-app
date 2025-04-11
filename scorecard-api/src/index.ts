import dotenv from "dotenv";

import { app } from "./app";
import prisma from "./db";

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, (): void => {
    console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
const shutdown = async (): Promise<void> => {
    console.log("Shutting down server...");

    server.close(async (): Promise<void> => {
        try {
            await prisma.$disconnect();
            console.log("Database disconnected");
            process.exit(0);
        } catch (error) {
            console.error("Error during shutdown:", error);
            process.exit(1);
        }
    });
};

// Handle various signals
process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
process.on("uncaughtException", (error) => {
    console.error("Uncaught exception:", error);
    shutdown();
});
