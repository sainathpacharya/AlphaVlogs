const mockIsMockMode = jest.fn(() => false);

jest.mock('@/config/api-config', () => ({
  isMockMode: () => mockIsMockMode(),
}));

describe('ssl-pinning config', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockIsMockMode.mockReturnValue(false);
    (global as { __DEV__?: boolean }).__DEV__ = true;
  });

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    jest.resetModules();
  });

  it('exports pinning constants', () => {
    const {
      SSL_PINNED_HOST,
      SSL_PUBLIC_KEY_HASHES,
      SSL_PINNING_CONFIG,
    } = require('../../src/config/ssl-pinning');

    expect(SSL_PINNED_HOST).toBe('api.alphavlogs.com');
    expect(SSL_PUBLIC_KEY_HASHES).toHaveLength(2);
    expect(SSL_PINNING_CONFIG.HOST).toBe('api.alphavlogs.com');
    expect(SSL_PINNING_CONFIG.INCLUDE_SUBDOMAINS).toBe(true);
    expect(SSL_PINNING_CONFIG.PUBLIC_KEY_HASHES).toEqual([...SSL_PUBLIC_KEY_HASHES]);
    expect(SSL_PINNING_CONFIG.ENABLED).toBe(false);
  });

  it('skips bootstrap when pinning is disabled in dev', async () => {
    const { bootstrapSslPinning } = require('../../src/config/ssl-pinning');
    const { initializeSslPinning } = require('react-native-ssl-public-key-pinning');

    await bootstrapSslPinning();
    expect(initializeSslPinning).not.toHaveBeenCalled();
  });

  it('skips bootstrap in mock mode when pinning would be enabled', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    mockIsMockMode.mockReturnValue(true);
    jest.resetModules();

    const { bootstrapSslPinning } = require('../../src/config/ssl-pinning');
    const { initializeSslPinning } = require('react-native-ssl-public-key-pinning');

    await bootstrapSslPinning();
    expect(initializeSslPinning).not.toHaveBeenCalled();
  });

  it('skips bootstrap when native pinning is unavailable in production', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    jest.resetModules();

    const { isSslPinningAvailable, initializeSslPinning } = require(
      'react-native-ssl-public-key-pinning',
    );
    isSslPinningAvailable.mockReturnValue(false);

    const { bootstrapSslPinning } = require('../../src/config/ssl-pinning');
    await bootstrapSslPinning();

    expect(initializeSslPinning).not.toHaveBeenCalled();
  });

  it('warns in dev when bootstrap runs with pinning forced on but native module is missing', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    jest.resetModules();

    const { isSslPinningAvailable } = require('react-native-ssl-public-key-pinning');
    const { bootstrapSslPinning, SSL_PINNING_CONFIG } = require('../../src/config/ssl-pinning');
    SSL_PINNING_CONFIG.ENABLED = true;
    isSslPinningAvailable.mockReturnValue(false);

    await bootstrapSslPinning();

    expect(console.warn).toHaveBeenCalledWith(
      '[ssl-pinning] Native module unavailable; skipping.',
    );
  });

  it('logs success in dev when bootstrap runs with pinning forced on', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    jest.resetModules();

    const { isSslPinningAvailable, initializeSslPinning } = require(
      'react-native-ssl-public-key-pinning',
    );
    const { bootstrapSslPinning, SSL_PINNING_CONFIG } = require('../../src/config/ssl-pinning');
    SSL_PINNING_CONFIG.ENABLED = true;
    isSslPinningAvailable.mockReturnValue(true);

    await bootstrapSslPinning();

    expect(console.log).toHaveBeenCalledWith('[ssl-pinning] Enabled for api.alphavlogs.com');
    expect(initializeSslPinning).toHaveBeenCalled();
  });

  it('initializes pinning when enabled and native module is available', async () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    jest.resetModules();

    const {
      isSslPinningAvailable,
      initializeSslPinning,
    } = require('react-native-ssl-public-key-pinning');
    isSslPinningAvailable.mockReturnValue(true);

    const {
      bootstrapSslPinning,
      SSL_PINNING_CONFIG,
    } = require('../../src/config/ssl-pinning');

    await bootstrapSslPinning();

    expect(initializeSslPinning).toHaveBeenCalledWith({
      [SSL_PINNING_CONFIG.HOST]: {
        includeSubdomains: SSL_PINNING_CONFIG.INCLUDE_SUBDOMAINS,
        publicKeyHashes: SSL_PINNING_CONFIG.PUBLIC_KEY_HASHES,
        expirationDate: SSL_PINNING_CONFIG.EXPIRATION_DATE,
      },
    });
  });

  it('returns a no-op unsubscribe when pinning listener is unavailable', () => {
    const { isSslPinningAvailable, addSslPinningErrorListener } = require(
      'react-native-ssl-public-key-pinning',
    );
    isSslPinningAvailable.mockReturnValue(false);

    const { subscribeSslPinningErrors } = require('../../src/config/ssl-pinning');
    const onError = jest.fn();
    const unsubscribe = subscribeSslPinningErrors(onError);

    expect(unsubscribe).toEqual(expect.any(Function));
    unsubscribe();
    expect(addSslPinningErrorListener).not.toHaveBeenCalled();
    expect(onError).not.toHaveBeenCalled();
  });

  it('forwards pinning errors to the callback', () => {
    const remove = jest.fn();
    const { isSslPinningAvailable, addSslPinningErrorListener } = require(
      'react-native-ssl-public-key-pinning',
    );
    isSslPinningAvailable.mockReturnValue(true);
    addSslPinningErrorListener.mockImplementation((handler) => {
      handler({ serverHostname: 'api.alphavlogs.com' });
      return { remove };
    });

    const { subscribeSslPinningErrors } = require('../../src/config/ssl-pinning');
    const onError = jest.fn();
    const unsubscribe = subscribeSslPinningErrors(onError);

    expect(onError).toHaveBeenCalledWith('api.alphavlogs.com');
    expect(console.warn).toHaveBeenCalledWith(
      '[ssl-pinning] Pin mismatch:',
      'api.alphavlogs.com',
    );

    unsubscribe();
    expect(remove).toHaveBeenCalled();
  });
});
