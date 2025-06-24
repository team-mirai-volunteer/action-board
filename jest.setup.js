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
  Crown: ({ className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "crown-icon",
      className,
    });
  },
  Trophy: ({ className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "trophy-icon",
      className,
    });
  },
  Medal: ({ className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "medal-icon",
      className,
    });
  },
  Menu: ({ className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "menu-icon",
      className,
    });
  },
  MapPin: ({ className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "map-pin-icon",
      className,
    });
  },
}));

const createMockSupabaseQuery = () => {
  const mockQuery = {
    eq: jest.fn(() => mockQuery),
    gte: jest.fn(() => mockQuery),
    lte: jest.fn(() => mockQuery),
    gt: jest.fn(() => mockQuery),
    lt: jest.fn(() => mockQuery),
    in: jest.fn(() => mockQuery),
    order: jest.fn(() => mockQuery),
    limit: jest.fn(() => mockQuery),
    range: jest.fn(() => mockQuery),
    neq: jest.fn(() => mockQuery),
    is: jest.fn(() => mockQuery),
    not: jest.fn(() => mockQuery),
    or: jest.fn(() => mockQuery),
    and: jest.fn(() => mockQuery),
    single: jest.fn(() => Promise.resolve({ data: null, error: null })),
    maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
  };
  return mockQuery;
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({ data: { user: null }, error: null }),
        ),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => createMockSupabaseQuery()),
        insert: jest.fn(() => createMockSupabaseQuery()),
        update: jest.fn(() => createMockSupabaseQuery()),
        delete: jest.fn(() => createMockSupabaseQuery()),
        upsert: jest.fn(() => createMockSupabaseQuery()),
      })),
    }),
  ),
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() =>
    Promise.resolve({
      auth: {
        getUser: jest.fn(() =>
          Promise.resolve({ data: { user: null }, error: null }),
        ),
      },
      from: jest.fn(() => ({
        select: jest.fn(() => createMockSupabaseQuery()),
        insert: jest.fn(() => createMockSupabaseQuery()),
        update: jest.fn(() => createMockSupabaseQuery()),
        delete: jest.fn(() => createMockSupabaseQuery()),
        upsert: jest.fn(() => createMockSupabaseQuery()),
      })),
    }),
  ),
}));

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: jest.fn(() => ({ pending: false })),
}));

jest.mock("@radix-ui/react-dialog", () => {
  const mockReact = require("react");
  return {
    Root: ({ children, open, onOpenChange }) => {
      return open
        ? mockReact.createElement(
            "div",
            { "data-testid": "dialog-root" },
            children,
          )
        : null;
    },
    Trigger: ({ children, asChild, ...props }) => {
      if (asChild && mockReact.Children.count(children) === 1) {
        return mockReact.cloneElement(children, props);
      }
      return mockReact.createElement(
        "button",
        { ...props, "data-testid": "dialog-trigger" },
        children,
      );
    },
    Portal: ({ children }) =>
      mockReact.createElement(
        "div",
        { "data-testid": "dialog-portal" },
        children,
      ),
    Overlay: ({ className, ...props }) =>
      mockReact.createElement("div", {
        ...props,
        className,
        "data-testid": "dialog-overlay",
      }),
    Content: ({ children, className, ...props }) =>
      mockReact.createElement(
        "div",
        {
          ...props,
          className,
          role: "dialog",
          "data-testid": "dialog-content",
        },
        children,
      ),
    Close: ({ children, className, ...props }) =>
      mockReact.createElement(
        "button",
        {
          ...props,
          className,
          "data-testid": "dialog-close",
        },
        children,
      ),
    Title: ({ children, className, ...props }) =>
      mockReact.createElement(
        "h2",
        {
          ...props,
          className,
          "data-testid": "dialog-title",
        },
        children,
      ),
    Description: ({ children, className, ...props }) =>
      mockReact.createElement(
        "p",
        {
          ...props,
          className,
          "data-testid": "dialog-description",
        },
        children,
      ),
  };
});
