// Jest setup file
// Mock server-only package for tests
jest.mock("server-only", () => ({}));

// Load environment variables for tests
require("dotenv").config({ path: ".env" });

require("@testing-library/jest-dom");

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
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
  redirect: jest.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));

jest.mock("next/headers", () => ({
  cookies: () => ({
    get: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
  }),
  headers: () => new Map(),
}));

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
  return chainable;
};

jest.mock("@/lib/supabase/server", () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => createChainableMock()),
    rpc: jest.fn(() => Promise.resolve({ data: [], error: null })),
    auth: {
      getUser: jest.fn(() =>
        Promise.resolve({ data: { user: null }, error: null }),
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
      })),
    },
  })),
}));

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-key";
