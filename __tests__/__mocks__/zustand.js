// Mock for zustand that handles the create<UserStore>()() pattern
const create = jest.fn(() => {
  // Return a function that takes the store creator
  return (storeCreator) => {
    // Create a shared state object that can be updated
    let state = {
      isLoading: false,
      isAuthenticated: false,
      user: null,
      networkStatus: {
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
        details: null,
      },
      location: null,
      theme: 'dark',
      language: 'en',
    };

    // Create action functions that update the state
    const actions = {
      setLoading: jest.fn((loading) => {
        state.isLoading = loading;
      }),
      setAuthenticated: jest.fn((authenticated) => {
        state.isAuthenticated = authenticated;
      }),
      setUser: jest.fn((user) => {
        state.user = user;
      }),
      setNetworkStatus: jest.fn((status) => {
        state.networkStatus = status;
      }),
      setLocation: jest.fn((location) => {
        state.location = location;
      }),
      setTheme: jest.fn((theme) => {
        state.theme = theme;
      }),
      setLanguage: jest.fn((language) => {
        state.language = language;
      }),
      reset: jest.fn(() => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.networkStatus = {
          isConnected: true,
          isInternetReachable: true,
          type: 'unknown',
          details: null,
        };
        state.location = null;
        state.theme = 'dark';
        state.language = 'en';
      }),
    };

    // Create a mock store that behaves like a Zustand store
    const mockStore = jest.fn((selector) => {
      const fullState = { ...state, ...actions };

      if (selector) {
        return selector(fullState);
      }
      return fullState;
    });

    // Add store methods
    mockStore.getState = jest.fn(() => mockStore());
    mockStore.setState = jest.fn();
    mockStore.subscribe = jest.fn(() => () => {});
    mockStore.destroy = jest.fn();

    return mockStore;
  };
});

const persist = jest.fn((config) => config);

const createJSONStorage = jest.fn(() => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve()),
  removeItem: jest.fn(() => Promise.resolve()),
}));

const subscribeWithSelector = jest.fn((config) => config);

module.exports = {
  create,
  persist,
  createJSONStorage,
  subscribeWithSelector,
};
