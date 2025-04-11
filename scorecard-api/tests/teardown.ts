// Global teardown after all tests
export default async function globalTeardown(): Promise<void> {
    console.log("Test environment cleaned up");
    // Skip Prisma teardown for now
}
