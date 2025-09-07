const nextJest = require("next/jest");

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: "./",
});

// Add any custom config to be passed to Jest
/** @type {import('jest').Config} */
const config = {
  testEnvironment: "jsdom",
  testMatch: ["**/*.test.{ts,tsx}"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "<rootDir>/src/{app,components,lib,features}/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.stories.{ts,tsx}",
  ],
  coverageReporters: ["html", "text", "lcov"],
  coverageDirectory: "<rootDir>/coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/src/app/privacy/",
    "<rootDir>/src/app/terms/",
    "<rootDir>/src/lib/types/",
    "<rootDir>/src/lib/supabase/",
    "<rootDir>/src/lib/address.ts",
    "<rootDir>/src/lib/constants.ts",
  ],
  coverageProvider: "v8",
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
