export const createClient = jest.fn(() => ({
  from: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  single: jest.fn(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  order: jest.fn(),
}));
