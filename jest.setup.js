// Jest setup file
const React = require("react");

// Mock server-only package for tests
jest.mock("server-only", () => ({}));

// Load environment variables for tests
require("dotenv").config({ path: ".env" });

require("@testing-library/jest-dom");

jest.mock("react", () => {
  const actual = jest.requireActual("react");
  return {
    ...actual,
    useState: jest.fn((initial) => [initial, jest.fn()]),
    useEffect: jest.fn((effect) => effect?.()),
    useContext: jest.fn(() => ({})),
    useActionState: jest.fn((action, initialState) => [
      initialState,
      jest.fn(),
    ]),
    useCallback: jest.fn((callback) => callback),
    useMemo: jest.fn((factory) => factory()),
    useRef: jest.fn(() => ({ current: null })),
  };
});

jest.mock("react-dom", () => ({
  ...jest.requireActual("react-dom"),
  useFormStatus: jest.fn(() => ({
    pending: false,
    data: null,
    method: null,
    action: null,
  })),
}));

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

global.Request =
  global.Request ||
  class Request {
    constructor(url, options = {}) {
      Object.defineProperty(this, "url", {
        value: url,
        writable: false,
        enumerable: true,
        configurable: true,
      });
      this.method = options.method || "GET";
      this.headers = new Headers(options.headers || {});
    }
  };

global.Response =
  global.Response ||
  class Response {
    constructor(body, options = {}) {
      this.body = body;
      this.status = options.status || 200;
      this.headers = new Headers(options.headers || {});
    }

    static json(data, options = {}) {
      return new Response(JSON.stringify(data), {
        ...options,
        headers: { "Content-Type": "application/json", ...options.headers },
      });
    }
  };

jest.mock("next/headers", () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Map(),
}));

jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => React.createElement("img", props),
}));

jest.mock("next/dist/shared/lib/image-config", () => ({
  imageConfigDefault: {
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    path: "/_next/image",
    loader: "default",
    domains: [],
    disableStaticImages: false,
    minimumCacheTTL: 60,
    formats: ["image/webp"],
    dangerouslyAllowSVG: false,
    contentSecurityPolicy: "script-src 'none'; frame-src 'none'; sandbox;",
  },
}));

jest.mock("nanoid", () => ({
  nanoid: jest.fn(() => "test-nanoid-12345"),
}));

global.TextEncoder = global.TextEncoder || require("node:util").TextEncoder;
global.TextDecoder = global.TextDecoder || require("node:util").TextDecoder;

const createChainableMock = () => {
  const chainable = {
    select: jest.fn(() => chainable),
    insert: jest.fn(() => chainable),
    update: jest.fn(() => chainable),
    delete: jest.fn(() => chainable),
    eq: jest.fn(() => chainable),
    neq: jest.fn(() => chainable),
    gt: jest.fn(() => chainable),
    gte: jest.fn(() => chainable),
    lt: jest.fn(() => chainable),
    lte: jest.fn(() => chainable),
    like: jest.fn(() => chainable),
    ilike: jest.fn(() => chainable),
    is: jest.fn(() => chainable),
    in: jest.fn(() => chainable),
    contains: jest.fn(() => chainable),
    containedBy: jest.fn(() => chainable),
    rangeGt: jest.fn(() => chainable),
    rangeGte: jest.fn(() => chainable),
    rangeLt: jest.fn(() => chainable),
    rangeLte: jest.fn(() => chainable),
    rangeAdjacent: jest.fn(() => chainable),
    overlaps: jest.fn(() => chainable),
    textSearch: jest.fn(() => chainable),
    match: jest.fn(() => chainable),
    not: jest.fn(() => chainable),
    or: jest.fn(() => chainable),
    filter: jest.fn(() => chainable),
    order: jest.fn(() => chainable),
    limit: jest.fn(() => chainable),
    range: jest.fn(() => chainable),
    single: jest.fn(() =>
      Promise.resolve({ data: null, error: null, count: 0 }),
    ),
    maybeSingle: jest.fn(() =>
      Promise.resolve({ data: null, error: null, count: 0 }),
    ),
  };

  chainable[Symbol.toStringTag] = "Promise";

  return chainable;
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => createChainableMock()),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({
          data: {
            user: {
              id: "test-user-id",
              email: "test@example.com",
              user_metadata: {
                date_of_birth: "1990-01-01",
                name: "Test User",
              },
            },
          },
          error: null,
        }),
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
  })),
  createServiceClient: jest.fn(() => ({
    from: jest.fn(() => createChainableMock()),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
}));

jest.mock("@/lib/supabase/client", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null })),
      insert: jest.fn(() => Promise.resolve({ data: [], error: null })),
      update: jest.fn(() => Promise.resolve({ data: [], error: null })),
      delete: jest.fn(() => Promise.resolve({ data: [], error: null })),
      single: jest.fn(() => Promise.resolve({ data: null, error: null })),
      maybeSingle: jest.fn(() => Promise.resolve({ data: null, error: null })),
    })),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null }),
      ),
      signOut: jest.fn(() => Promise.resolve({ error: null })),
    },
    storage: {
      from: jest.fn(() => ({
        upload: jest.fn(() =>
          Promise.resolve({ data: { path: "test-path" }, error: null }),
        ),
        download: jest.fn(() =>
          Promise.resolve({ data: new Blob(), error: null }),
        ),
        getPublicUrl: jest.fn(() => ({
          data: {
            publicUrl:
              "https://test.supabase.co/storage/v1/object/public/test-path",
          },
        })),
      })),
    },
  })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
