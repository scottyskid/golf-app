module.exports = {
    preset: "ts-jest",
    testEnvironment: "node",
    roots: ["<rootDir>/src/", "<rootDir>/src/tests/"],
    transform: {
        "^.+\\.tsx?$": "ts-jest",
    },
    moduleFileExtensions: ["ts", "tsx", "js", "jsx", "json", "node"],
    testMatch: ["**/*.test.ts"],
    coverageDirectory: "coverage",
    collectCoverageFrom: ["src/**/*.{ts,tsx,js,jsx}", "!src/**/*.d.ts"],
    globalSetup: "<rootDir>/src/tests/setup.ts",
    globalTeardown: "<rootDir>/src/tests/teardown.ts",
    setupFilesAfterEnv: ["<rootDir>/src/tests/testSetup.ts"],
    testPathIgnorePatterns: ["/node_modules/", "/build/", "/dist/"],
    verbose: false,
    transformIgnorePatterns: ["node_modules/(?!(chai|superagent)/)"],
};
