module.exports = {
  addSmsListener: jest.fn(),
  removeSmsListener: jest.fn(),
  getSmsHash: jest.fn(() => Promise.resolve('<#ABC123>')),
  isSupported: jest.fn(() => Promise.resolve(true)),
};
