const React = require('react');

const useTranslation = () => ({
  t: jest.fn((key) => key),
  i18n: {
    changeLanguage: jest.fn(),
    language: 'en',
    exists: jest.fn(() => true),
  },
  ready: true,
});

const initReactI18next = {
  type: '3rdParty',
  init: jest.fn(),
};

module.exports = {
  useTranslation,
  initReactI18next,
};
