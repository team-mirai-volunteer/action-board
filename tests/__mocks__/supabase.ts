const createMockQuery = (data: unknown[] = []) => {
  const query = {
    select: jest.fn(),
    eq: jest.fn(),
    not: jest.fn(),
    order: jest.fn(),
    limit: jest.fn(),
  };

  query.select.mockImplementation((columns?: string) => {
    if (columns === "mission_id") {
      return {
        eq: jest.fn().mockResolvedValue({ data }),
      };
    }
    if (columns === "mission_id, achievement_count") {
      return Promise.resolve({ data });
    }
    return query;
  });

  query.eq.mockReturnValue(query);
  query.not.mockReturnValue(query);
  query.order.mockReturnValue(query);
  query.limit.mockResolvedValue({ data });

  return query;
};

export const mockUpload = jest.fn().mockResolvedValue({ 
  data: { path: "test-path/test-file.jpg" }, 
  error: null 
});

export const mockSupabaseClient = {
  from: jest.fn((table: string) => createMockQuery([])),
  storage: {
    from: jest.fn(() => ({
      upload: mockUpload,
    })),
  },
};

export const createClient = jest.fn(() => mockSupabaseClient);
