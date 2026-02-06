// Jest setup file
const _React = require("react");

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
  ChevronRight: ({ className }) => {
    const mockReact = require("react");
    return mockReact.createElement("div", {
      "data-testid": "chevron-right-icon",
      className,
    });
  },
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

const _createMockSupabaseQuery = () => {
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
    single: jest.fn(() =>
      Promise.resolve({
        data: {
          id: "test-user-id",
          name: "テストユーザー",
          address_prefecture: "東京都",
          avatar_url: null,
        },
        error: null,
      }),
    ),
    maybeSingle: jest.fn(() =>
      Promise.resolve({
        data: {
          id: "test-user-id",
          name: "テストユーザー",
          address_prefecture: "東京都",
          avatar_url: null,
        },
        error: null,
      }),
    ),
  };
  return mockQuery;
};

jest.mock("@/lib/supabase/adminClient", () => ({
  createAdminClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null }),
      ),
    },
    from: jest.fn(() => {
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
          maybeSingle: jest.fn(() =>
            Promise.resolve({ data: null, error: null }),
          ),
        };
        return mockQuery;
      };

      return {
        select: jest.fn(() => createMockSupabaseQuery()),
        insert: jest.fn(() => createMockSupabaseQuery()),
        update: jest.fn(() => createMockSupabaseQuery()),
        delete: jest.fn(() => createMockSupabaseQuery()),
        upsert: jest.fn(() => createMockSupabaseQuery()),
      };
    }),
  })),
}));

jest.mock("@/lib/supabase/client", () => {
  const mockAuth = {
    getUser: jest.fn(() =>
      Promise.resolve({ data: { user: null }, error: null }),
    ),
  };
  const mockStorage = {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({
        data: { path: "test/path/file.jpg" },
        error: null,
      }),
      remove: jest.fn().mockResolvedValue({ error: null }),
      getPublicUrl: jest.fn(() => ({
        data: { publicUrl: "https://example.com/avatar.jpg" },
      })),
    })),
  };
  return {
    getAuth: jest.fn(() => mockAuth),
    getStorage: jest.fn(() => mockStorage),
    createClient: jest.fn(() => ({
    auth: mockAuth,
    from: jest.fn(() => {
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
          single: jest.fn(() =>
            Promise.resolve({
              data: {
                id: "test-user-id",
                name: "テストユーザー",
                address_prefecture: "東京都",
                avatar_url: null,
              },
              error: null,
            }),
          ),
          maybeSingle: jest.fn(() =>
            Promise.resolve({
              data: {
                id: "test-user-id",
                name: "テストユーザー",
                address_prefecture: "東京都",
                avatar_url: null,
              },
              error: null,
            }),
          ),
        };
        return mockQuery;
      };

      return {
        select: jest.fn(() => createMockSupabaseQuery()),
        insert: jest.fn(() => createMockSupabaseQuery()),
        update: jest.fn(() => createMockSupabaseQuery()),
        delete: jest.fn(() => createMockSupabaseQuery()),
        upsert: jest.fn(() => createMockSupabaseQuery()),
      };
    }),
    storage: mockStorage,
  })),
  };
});

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: jest.fn(() => ({ pending: false })),
}));

jest.mock("@/features/user-level/services/level", () => ({
  getUserLevel: jest.fn(() =>
    Promise.resolve({
      user_id: "test-user-id",
      level: 2,
      xp: 100,
      last_notified_level: 1,
      updated_at: "2023-01-01T00:00:00Z",
    }),
  ),
}));

jest.mock("@/features/user-profile/services/profile", () => ({
  getPrivateUserData: jest.fn(() =>
    Promise.resolve({
      id: "test-user-id",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
    }),
  ),
  getProfile: jest.fn(() =>
    Promise.resolve({
      id: "test-user-id",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
    }),
  ),
  getMyProfile: jest.fn(() =>
    Promise.resolve({
      id: "test-user-id",
      name: "テストユーザー",
      address_prefecture: "東京都",
      avatar_url: null,
      email: "test@example.com",
    }),
  ),
  getUser: jest.fn(() =>
    Promise.resolve({
      id: "test-user-id",
      email: "test@example.com",
    }),
  ),
}));

jest.mock("@radix-ui/react-dialog", () => {
  const mockReact = require("react");

  const createMockComponent = (displayName, defaultElement = "div") => {
    const component = mockReact.forwardRef(
      ({ children, className, ...props }, ref) =>
        mockReact.createElement(
          defaultElement,
          {
            ...props,
            className,
            ref,
            "data-testid": `dialog-${displayName.toLowerCase()}`,
          },
          children,
        ),
    );
    component.displayName = displayName;
    return component;
  };

  const mockComponents = {
    Root: ({ children, open }) => {
      return open
        ? mockReact.createElement(
            "div",
            { "data-testid": "dialog-root" },
            children,
          )
        : null;
    },
    Trigger: createMockComponent("DialogTrigger", "button"),
    Portal: ({ children }) =>
      mockReact.createElement(
        "div",
        { "data-testid": "dialog-portal" },
        children,
      ),
    Overlay: createMockComponent("DialogOverlay"),
    Content: createMockComponent("DialogContent"),
    Close: createMockComponent("DialogClose", "button"),
    Title: createMockComponent("DialogTitle", "h2"),
    Description: createMockComponent("DialogDescription", "p"),
  };

  return mockComponents;
});

jest.mock("@/features/metrics/services/get-metrics", () => ({
  fetchSupporterData: jest.fn(() =>
    Promise.resolve({
      totalCount: 75982,
      last24hCount: 1710,
      updatedAt: "2025-07-03T02:20:00Z",
    }),
  ),
  fetchDonationData: jest.fn(() =>
    Promise.resolve({
      totalAmount: 100000000,
      last24hAmount: 500000,
      updatedAt: "2025-07-03T02:20:00Z",
    }),
  ),
  fetchAchievementData: jest.fn(() =>
    Promise.resolve({
      totalCount: 1234,
      todayCount: 56,
    }),
  ),
  fetchRegistrationData: jest.fn(() =>
    Promise.resolve({
      totalCount: 567,
      todayCount: 12,
    }),
  ),
  fetchAllMetricsData: jest.fn(() =>
    Promise.resolve({
      supporter: {
        totalCount: 75982,
        last24hCount: 1710,
        updatedAt: "2025-07-03T02:20:00Z",
      },
      donation: {
        totalAmount: 100000000,
        last24hAmount: 500000,
        updatedAt: "2025-07-03T02:20:00Z",
      },
      achievement: {
        totalCount: 1234,
        todayCount: 56,
      },
      registration: {
        totalCount: 567,
        todayCount: 12,
      },
    }),
  ),
}));
