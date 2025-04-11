// import { PrismaClient } from '@prisma/client';

// Global setup before all tests
export default async function globalSetup(): Promise<void> {
    console.log("Test environment set up");
    // Skip Prisma initialization for now
}

// Global teardown after all tests
export async function globalTeardown(): Promise<void> {
    console.log("Test environment cleaned up");
    // Skip Prisma teardown for now
}
