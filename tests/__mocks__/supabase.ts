const createMockQuery = (data: unknown[] = []) => {
  const query: any = {};
  
  const methods = ['select', 'eq', 'not', 'order', 'limit', 'then'];
  
  methods.forEach(method => {
    query[method] = jest.fn();
  });

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
  query.then.mockResolvedValue({ data });

  return query;
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
