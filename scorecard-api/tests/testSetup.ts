
import { jest, beforeAll, afterAll } from '@jest/globals';

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

// Increase test timeout
jest.setTimeout(30000);

// Mock modules as needed
jest.mock('../src/utils/logger', () => ({
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
}));

// Jest hooks for all tests

// Global before all
beforeAll(async () => {
  console.log('Test setup complete');
});

// Global after all
afterAll(async () => {
  console.log('Test teardown complete');
}); 