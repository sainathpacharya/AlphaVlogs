module.exports = {
  createConfig: jest.fn(() => ({
    aliases: {},
    tokens: {},
    globalStyle: {},
  })),
  createComponents: jest.fn(() => ({})),
  createTheme: jest.fn(() => ({})),
};
