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
    "^@/(.*)$": "<rootDir>/$1",
  },
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  collectCoverage: true,
  collectCoverageFrom: [
    "{app,components,lib}/**/*.{ts,tsx}",
    "!**/*.d.ts",
    "!**/*.stories.{ts,tsx}",
  ],
  coverageReporters: ["html", "text", "lcov"],
  coverageDirectory: "<rootDir>/coverage",
  coveragePathIgnorePatterns: [
    "<rootDir>/app/privacy/",
    "<rootDir>/app/terms/",
    "<rootDir>/lib/types/",
    "<rootDir>/lib/supabase/",
    "<rootDir>/lib/address.ts",
    "<rootDir>/lib/constants.ts",
  ],
  coverageProvider: "v8",
  reporters: ["default", "jest-junit", "jest-coverage-comment"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
module.exports = createJestConfig(config);
