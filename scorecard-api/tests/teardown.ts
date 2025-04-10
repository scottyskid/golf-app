// Global teardown after all tests
export default async function globalTeardown() {
  console.log('Test environment cleaned up');
  // Skip Prisma teardown for now
} 