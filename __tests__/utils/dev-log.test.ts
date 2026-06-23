import { devLog } from '../../src/utils/dev-log';

describe('dev-log utils', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
    jest.clearAllMocks();
  });

  it('logs message only when data is omitted in dev', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    devLog('hello');
    expect(console.log).toHaveBeenCalledWith('[AlphaVlogs]', 'hello');
  });

  it('logs message and data in dev', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    const payload = { id: 1 };
    devLog('payload', payload);
    expect(console.log).toHaveBeenCalledWith('[AlphaVlogs]', 'payload', payload);
  });

  it('does not log in production builds', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    devLog('hidden', { secret: true });
    expect(console.log).not.toHaveBeenCalled();
  });
});
