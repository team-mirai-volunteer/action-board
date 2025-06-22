const createMockQuery = (data: unknown[] = []) => {
  const mockQuery = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    not: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
  };

  for (const key of Object.keys(mockQuery)) {
    mockQuery[key as keyof typeof mockQuery].mockImplementation(() => ({
      ...mockQuery,
      then: jest.fn().mockResolvedValue({ data }),
    }));
  }

  return {
    ...mockQuery,
    then: jest.fn().mockResolvedValue({ data }),
  };
};

export const mockSupabaseClient = {
  from: jest.fn((table: string) => createMockQuery()),
  storage: {
    from: jest.fn(() => ({
      upload: jest.fn(),
    })),
  },
};

export const createClient = jest.fn(() => mockSupabaseClient);
