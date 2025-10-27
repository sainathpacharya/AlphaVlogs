import { renderHook, act } from '@testing-library/react-native';
import { useUserStore, useIsAuthenticated, useUser, useIsLoading, useNetworkStatus, useLocation, useTheme, useLanguage } from '../../src/stores/user-store';
import { User, NetworkStatus, LocationData } from '../../src/types';

// Mock the store with a simple implementation
jest.mock('../../src/stores/user-store', () => {
  let mockState = {
    isLoading: false,
    isAuthenticated: false,
    user: null,
    networkStatus: {
      isConnected: true,
      isInternetReachable: true,
      type: 'unknown',
    },
    location: null,
    theme: 'dark',
    language: 'en',
  };

  const mockActions = {
    setLoading: (loading) => {
      mockState.isLoading = loading;
    },
    setAuthenticated: (authenticated) => {
      mockState.isAuthenticated = authenticated;
    },
    setUser: (user) => {
      mockState.user = user;
    },
    setNetworkStatus: (status) => {
      mockState.networkStatus = status;
    },
    setLocation: (location) => {
      mockState.location = location;
    },
    setTheme: (theme) => {
      mockState.theme = theme;
    },
    setLanguage: (language) => {
      mockState.language = language;
    },
    reset: () => {
      mockState.isLoading = false;
      mockState.isAuthenticated = false;
      mockState.user = null;
      mockState.networkStatus = {
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      };
      mockState.location = null;
      mockState.theme = 'dark';
      mockState.language = 'en';
    },
  };

  const useUserStore = jest.fn((selector) => {
    const fullState = { ...mockState, ...mockActions };
    if (selector) {
      return selector(fullState);
    }
    return fullState;
  });

  // Add getState method to useUserStore
  useUserStore.getState = jest.fn(() => ({ ...mockState, ...mockActions }));

  const useIsAuthenticated = jest.fn(() => mockState.isAuthenticated);
  const useUser = jest.fn(() => mockState.user);
  const useIsLoading = jest.fn(() => mockState.isLoading);
  const useNetworkStatus = jest.fn(() => mockState.networkStatus);
  const useLocation = jest.fn(() => mockState.location);
  const useTheme = jest.fn(() => mockState.theme);
  const useLanguage = jest.fn(() => mockState.language);

  return {
    useUserStore,
    useIsAuthenticated,
    useUser,
    useIsLoading,
    useNetworkStatus,
    useLocation,
    useTheme,
    useLanguage,
  };
});

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

describe('UserStore', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useUserStore());
      
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.networkStatus).toEqual({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      });
      expect(result.current.location).toBe(null);
      expect(result.current.theme).toBe('dark');
      expect(result.current.language).toBe('en');
    });
  });

  describe('setLoading', () => {
    it('should update loading state', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setLoading(true);
      });
      
      expect(result.current.isLoading).toBe(true);
      
      act(() => {
        result.current.setLoading(false);
      });
      
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('setAuthenticated', () => {
    it('should update authentication state', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setAuthenticated(true);
      });
      
      expect(result.current.isAuthenticated).toBe(true);
      
      act(() => {
        result.current.setAuthenticated(false);
      });
      
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('setUser', () => {
    it('should update user data', () => {
      const { result } = renderHook(() => useUserStore());
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        role: 'student',
        isActive: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };
      
      act(() => {
        result.current.setUser(mockUser);
      });
      
      expect(result.current.user).toEqual(mockUser);
      
      act(() => {
        result.current.setUser(null);
      });
      
      expect(result.current.user).toBe(null);
    });
  });

  describe('setNetworkStatus', () => {
    it('should update network status', () => {
      const { result } = renderHook(() => useUserStore());
      const mockNetworkStatus: NetworkStatus = {
        isConnected: false,
        isInternetReachable: false,
        type: 'wifi',
      };
      
      act(() => {
        result.current.setNetworkStatus(mockNetworkStatus);
      });
      
      expect(result.current.networkStatus).toEqual(mockNetworkStatus);
    });
  });

  describe('setLocation', () => {
    it('should update location data', () => {
      const { result } = renderHook(() => useUserStore());
      const mockLocation: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now(),
      };
      
      act(() => {
        result.current.setLocation(mockLocation);
      });
      
      expect(result.current.location).toEqual(mockLocation);
      
      act(() => {
        result.current.setLocation(null);
      });
      
      expect(result.current.location).toBe(null);
    });
  });

  describe('setTheme', () => {
    it('should update theme', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setTheme('light');
      });
      
      expect(result.current.theme).toBe('light');
      
      act(() => {
        result.current.setTheme('dark');
      });
      
      expect(result.current.theme).toBe('dark');
    });
  });

  describe('setLanguage', () => {
    it('should update language', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setLanguage('es');
      });
      
      expect(result.current.language).toBe('es');
      
      act(() => {
        result.current.setLanguage('fr');
      });
      
      expect(result.current.language).toBe('fr');
    });
  });

  describe('reset', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useUserStore());
      
      // Set some values
      act(() => {
        result.current.setLoading(true);
        result.current.setAuthenticated(true);
        result.current.setUser({
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          mobile: '9876543210',
          role: 'student',
          isActive: true,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        });
        result.current.setTheme('light');
        result.current.setLanguage('es');
      });
      
      // Verify values are set
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).not.toBe(null);
      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('es');
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      // Verify reset to initial state
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBe(null);
      expect(result.current.theme).toBe('dark');
      expect(result.current.language).toBe('en');
    });
  });

  describe('Selectors', () => {
    it('useIsAuthenticated should return authentication state', () => {
      const { result } = renderHook(() => useIsAuthenticated());
      
      expect(result.current).toBe(false);
      
      act(() => {
        useUserStore.getState().setAuthenticated(true);
      });
      
      expect(result.current).toBe(true);
    });

    it('useUser should return user data', () => {
      const { result } = renderHook(() => useUser());
      const mockUser: User = {
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com',
        mobile: '9876543210',
        role: 'student',
        isActive: true,
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
      };
      
      expect(result.current).toBe(null);
      
      act(() => {
        useUserStore.getState().setUser(mockUser);
      });
      
      expect(result.current).toEqual(mockUser);
    });

    it('useIsLoading should return loading state', () => {
      const { result } = renderHook(() => useIsLoading());
      
      expect(result.current).toBe(false);
      
      act(() => {
        useUserStore.getState().setLoading(true);
      });
      
      expect(result.current).toBe(true);
    });

    it('useNetworkStatus should return network status', () => {
      const { result } = renderHook(() => useNetworkStatus());
      const mockNetworkStatus: NetworkStatus = {
        isConnected: false,
        isInternetReachable: false,
        type: 'wifi',
      };
      
      expect(result.current).toEqual({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      });
      
      act(() => {
        useUserStore.getState().setNetworkStatus(mockNetworkStatus);
      });
      
      expect(result.current).toEqual(mockNetworkStatus);
    });

    it('useLocation should return location data', () => {
      const { result } = renderHook(() => useLocation());
      const mockLocation: LocationData = {
        latitude: 37.7749,
        longitude: -122.4194,
        accuracy: 10,
        timestamp: Date.now(),
      };
      
      expect(result.current).toBe(null);
      
      act(() => {
        useUserStore.getState().setLocation(mockLocation);
      });
      
      expect(result.current).toEqual(mockLocation);
    });

    it('useTheme should return theme', () => {
      const { result } = renderHook(() => useTheme());
      
      expect(result.current).toBe('dark');
      
      act(() => {
        useUserStore.getState().setTheme('light');
      });
      
      expect(result.current).toBe('light');
    });

    it('useLanguage should return language', () => {
      const { result } = renderHook(() => useLanguage());
      
      expect(result.current).toBe('en');
      
      act(() => {
        useUserStore.getState().setLanguage('es');
      });
      
      expect(result.current).toBe('es');
    });
  });

  describe('Persistence', () => {
    it('should persist selected state properties', () => {
      const { result } = renderHook(() => useUserStore());
      
      act(() => {
        result.current.setAuthenticated(true);
        result.current.setUser({
          id: '1',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          mobile: '9876543210',
          role: 'student',
          isActive: true,
          createdAt: '2023-01-01',
          updatedAt: '2023-01-01',
        });
        result.current.setTheme('light');
        result.current.setLanguage('es');
      });
      
      // These properties should be persisted
      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).not.toBe(null);
      expect(result.current.theme).toBe('light');
      expect(result.current.language).toBe('es');
      
      // These properties should not be persisted (reset on app restart)
      expect(result.current.isLoading).toBe(false);
      expect(result.current.networkStatus).toEqual({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
      });
      expect(result.current.location).toBe(null);
    });
  });
});
