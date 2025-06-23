// Jest setup file
const React = require("react");

require("@testing-library/jest-dom");

// Mock server-only package for tests
jest.mock("server-only", () => ({}));

// Load environment variables for tests
require("dotenv").config({ path: ".env" });

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

jest.mock("next/link", () => {
  return ({ children, href, ...props }) => {
    const mockReact = require("react");
    return mockReact.createElement("a", { href, ...props }, children);
  };
});

jest.mock("lucide-react", () => ({
  CheckIcon: ({ size, className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "check-icon",
      style: { width: size, height: size },
      className,
    });
  },
  CircleDashed: ({ size, className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "circle-dashed-icon",
      style: { width: size, height: size },
      className,
    });
  },
}));
