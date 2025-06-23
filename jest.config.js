const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  projects: [
    {
      displayName: "rls",
      testEnvironment: "node",
      testMatch: ["**/tests/rls/**/*.test.ts"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
    {
      displayName: "unit",
      testEnvironment: "jsdom",
      testMatch: ["**/tests/**/*.test.{ts,tsx}"],
      testPathIgnorePatterns: ["**/tests/rls/**"],
      moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
      },
      setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
    },
  ],
  collectCoverage: true,
  collectCoverageFrom: ["(app|components|lib|stories)/**/*.(ts|tsx)"],
  coverageReporters: ["html", "text", "lcov"],
  coverageDirectory: "<rootDir>/coverage",
  coveragePathIgnorePatterns: [],
  coverageProvider: "v8",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
