const createMockQuery = (data: unknown[] = []) => {
  const mockResult = { data };
  
  const mockQuery = {
    then: jest.fn((onResolve) => {
      return Promise.resolve(onResolve ? onResolve(mockResult) : mockResult);
    }),
    select: jest.fn().mockImplementation((columns?: string) => {
      if (columns === "mission_id") {
        return {
          eq: jest.fn().mockResolvedValue({ data }),
        };
      }
      if (columns === "mission_id, achievement_count") {
        return Promise.resolve({ data });
      }
      return Promise.resolve(mockResult);
    }),
    eq: jest.fn().mockResolvedValue(mockResult),
    not: jest.fn().mockResolvedValue(mockResult),
    order: jest.fn().mockResolvedValue(mockResult),
    limit: jest.fn().mockResolvedValue(mockResult),
  };
  
  return mockQuery;
};

export const mockSupabaseClient = {
  from: jest.fn((table: string) => createMockQuery([])),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
};

export const createClient = jest.fn(() => Promise.resolve(mockSupabaseClient));
