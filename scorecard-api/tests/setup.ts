// Global setup before all tests
export default async function globalSetup() {
  console.log('Test environment set up');
  // Skip Prisma initialization for now
}

// Global teardown after all tests
export async function globalTeardown() {
  console.log('Test environment cleaned up');
  // Skip Prisma teardown for now
} 