// import { PrismaClient } from '@prisma/client';

// Global before all
beforeAll(async () => {
  console.log('Test setup complete');
});

// Global after all
afterAll(async () => {
  console.log('Test teardown complete');
});

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