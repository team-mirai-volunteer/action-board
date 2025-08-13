export const mockMap = {
  setView: jest.fn().mockReturnThis(),
  remove: jest.fn(),
  invalidateSize: jest.fn(),
  pm: true,
};

export const mockIcon = {
  Default: Object.assign(
    jest.fn().mockImplementation(() => ({})),
    {
      prototype: {
        _getIconUrl: undefined,
      },
      mergeOptions: jest.fn(),
    },
  ),
};

const mockLeaflet = {
  map: jest.fn(() => mockMap),
  Icon: mockIcon,
};

export default mockLeaflet;
