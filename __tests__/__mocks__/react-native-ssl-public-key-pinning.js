module.exports = {
  isSslPinningAvailable: jest.fn(() => false),
  initializeSslPinning: jest.fn(() => Promise.resolve()),
  disableSslPinning: jest.fn(() => Promise.resolve()),
  addSslPinningErrorListener: jest.fn(() => ({remove: jest.fn()})),
};
