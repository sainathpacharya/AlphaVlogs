import {getActiveRouteName} from '../../src/utils/navigation-route';

describe('getActiveRouteName', () => {
  it('returns the deepest active route in nested navigators', () => {
    const state = {
      index: 0,
      routes: [
        {
          name: 'App',
          state: {
            index: 1,
            routes: [{name: 'Dashboard'}, {name: 'Quiz'}],
          },
        },
      ],
    };

    expect(getActiveRouteName(state)).toBe('Quiz');
  });

  it('returns the route name for a flat navigator', () => {
    const state = {
      index: 0,
      routes: [{name: 'Login'}],
    };

    expect(getActiveRouteName(state)).toBe('Login');
  });

  it('returns undefined when navigation state is missing', () => {
    expect(getActiveRouteName(undefined)).toBeUndefined();
  });

  it('returns undefined when the active route is missing', () => {
    const state = {
      index: 3,
      routes: [{name: 'Login'}],
    };

    expect(getActiveRouteName(state)).toBeUndefined();
  });
});
