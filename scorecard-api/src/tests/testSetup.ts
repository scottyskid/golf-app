import { jest, beforeAll, afterAll } from "@jest/globals";
import { PrismaClient } from "@prisma/client";
import { mockDeep, mockReset, DeepMockProxy } from "jest-mock-extended";

import prisma from "./prismaClient";

// Increase test timeout
jest.setTimeout(30000);
// Jest hooks for all tests

// Global before all
beforeAll(async () => {
    console.log("Test setup complete");
});

// Global after all
afterAll(async () => {
    console.log("Test teardown complete");
});

// Mocks the prisma client in a singleton pattern
// https://www.prisma.io/docs/orm/prisma-client/testing/unit-testing
jest.mock("./prismaClient", () => ({
    __esModule: true,
    default: mockDeep<PrismaClient>(),
}));

beforeEach(() => {
    mockReset(prismaMock);
});

export const prismaMock = prisma as unknown as DeepMockProxy<PrismaClient>;
