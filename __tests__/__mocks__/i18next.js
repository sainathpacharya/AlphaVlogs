const i18next = {
  init: jest.fn(),
  changeLanguage: jest.fn(),
  t: jest.fn((key) => key),
  exists: jest.fn(() => true),
  language: 'en',
  languages: ['en'],
  isInitialized: true,
  on: jest.fn(),
  off: jest.fn(),
  emit: jest.fn(),
};

module.exports = i18next;
