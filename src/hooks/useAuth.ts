import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUserStore, useUserCachedStore } from '@/stores';
import authService, { LoginRequest, RegisterRequest, OTPVerificationRequest } from '@/services/auth-service';
import { User, AuthTokens } from '@/types';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setAuthenticated, setUser, setLoading } = useUserStore();
  const { setTokens, setUserData, clearAll } = useUserCachedStore();

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens securely
        await setTokens(tokens);

        // Update stores
        setUserData(user);
        setUser(user);
        setAuthenticated(true);

        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['user'] });

        return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
      } else {
        return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
      }
    },
    onError: (error: any) => {
      return { success: false, message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      if (response.success) {
        return { success: true, message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS };
      } else {
        return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
      }
    },
    onError: (error: any) => {
      return { success: false, message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
    },
  });

  // OTP verification mutation
  const verifyOTPMutation = useMutation({
    mutationFn: (data: OTPVerificationRequest) => authService.verifyOTP(data),
    onSuccess: async (response) => {
      if (response.success && response.data) {
        const { user, tokens } = response.data;

        // Store tokens securely
        await setTokens(tokens);

        // Update stores
        setUserData(user);
        setUser(user);
        setAuthenticated(true);

        // Invalidate and refetch user data
        queryClient.invalidateQueries({ queryKey: ['user'] });

        return { success: true, message: 'OTP verified successfully!' };
      } else {
        return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
      }
    },
    onError: (error: any) => {
      return { success: false, message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: async () => {
      // Clear all stored data
      await clearAll();

      // Reset stores
      setUser(null);
      setAuthenticated(false);

      // Clear all queries
      queryClient.clear();

      return { success: true, message: SUCCESS_MESSAGES.LOGOUT_SUCCESS };
    },
    onError: async () => {
      // Even if logout API fails, clear local data
      await clearAll();
      setUser(null);
      setAuthenticated(false);
      queryClient.clear();

      return { success: true, message: SUCCESS_MESSAGES.LOGOUT_SUCCESS };
    },
  });

  // Get user profile query
  const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
    queryKey: ['user', 'profile'],
    queryFn: () => authService.getProfile(),
    enabled: false, // Only fetch when explicitly called
    retry: 1,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: (response) => {
      if (response.success && response.data) {
        // Update stores
        setUserData(response.data);
        setUser(response.data);

        // Invalidate user queries
        queryClient.invalidateQueries({ queryKey: ['user'] });

        return { success: true, message: SUCCESS_MESSAGES.PROFILE_UPDATED };
      } else {
        return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
      }
    },
    onError: (error: any) => {
      return { success: false, message: error.message || ERROR_MESSAGES.UNKNOWN_ERROR };
    },
  });

  // Login function
  const login = useCallback(async (data: LoginRequest) => {
    setLoading(true);
    try {
      const result = await loginMutation.mutateAsync(data);
      return result;
    } finally {
      setLoading(false);
    }
  }, [loginMutation, setLoading]);

  // Register function
  const register = useCallback(async (data: RegisterRequest) => {
    setLoading(true);
    try {
      const result = await registerMutation.mutateAsync(data);
      return result;
    } finally {
      setLoading(false);
    }
  }, [registerMutation, setLoading]);

  // Verify OTP function
  const verifyOTP = useCallback(async (data: OTPVerificationRequest) => {
    setLoading(true);
    try {
      const result = await verifyOTPMutation.mutateAsync(data);
      return result;
    } finally {
      setLoading(false);
    }
  }, [verifyOTPMutation, setLoading]);

  // Logout function
  const logout = useCallback(async () => {
    setLoading(true);
    try {
      const result = await logoutMutation.mutateAsync();
      return result;
    } finally {
      setLoading(false);
    }
  }, [logoutMutation, setLoading]);

  // Update profile function
  const updateProfile = useCallback(async (data: Partial<User>) => {
    setLoading(true);
    try {
      const result = await updateProfileMutation.mutateAsync(data);
      return result;
    } finally {
      setLoading(false);
    }
  }, [updateProfileMutation, setLoading]);

  // Get profile function
  const getProfile = useCallback(async () => {
    setLoading(true);
    try {
      const result = await queryClient.fetchQuery({
        queryKey: ['user', 'profile'],
        queryFn: () => authService.getProfile(),
      });
      return result;
    } finally {
      setLoading(false);
    }
  }, [queryClient, setLoading]);

  return {
    // Mutations
    login,
    register,
    verifyOTP,
    logout,
    updateProfile,
    getProfile,

    // Loading states
    isLoading: loginMutation.isPending || registerMutation.isPending ||
               verifyOTPMutation.isPending || logoutMutation.isPending ||
               updateProfileMutation.isPending,

    // Data
    userProfile: userProfile?.data,
    isLoadingProfile,

    // Error states
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verifyOTPError: verifyOTPMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
};
