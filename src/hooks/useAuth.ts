import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '@/stores';
import authService, {
  LoginRequest,
  RegisterRequest,
  OTPVerificationRequest,
} from '@/services/auth-service';
import { User } from '@/types';
import { SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/constants';
import { queryKeys } from '@/lib/query-keys';
import {
  useDeleteAccountMutation,
  useLoginMutation,
  useLogoutMutation,
  useProfileQuery,
  useRegisterMutation,
  useUpdateProfileMutation,
  useVerifyOtpMutation,
} from './api/use-auth-api';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const { setLoading } = useUserStore();

  const loginMutation = useLoginMutation();
  const registerMutation = useRegisterMutation();
  const verifyOTPMutation = useVerifyOtpMutation();
  const logoutMutation = useLogoutMutation();
  const updateProfileMutation = useUpdateProfileMutation();
  const { data: userProfile, isLoading: isLoadingProfile } = useProfileQuery(false);

  const runWithLoading = useCallback(
    async <T,>(action: () => Promise<T>): Promise<T> => {
      setLoading(true);
      try {
        return await action();
      } finally {
        setLoading(false);
      }
    },
    [setLoading],
  );

  const mapVerifyResult = (response: Awaited<ReturnType<typeof authService.verifyOTP>>) => {
    if (response.success && response.data?.tokens && response.data.user) {
      return { success: true, message: SUCCESS_MESSAGES.LOGIN_SUCCESS };
    }
    if (response.success && response.data?.selectionRequired) {
      return {
        success: true,
        message: 'OTP verified. Please select a student profile.',
        selectionRequired: true,
        profiles: response.data.profiles,
      };
    }
    return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
  };

  const login = useCallback(
    async (data: LoginRequest) =>
      runWithLoading(async () => mapVerifyResult(await loginMutation.mutateAsync(data))),
    [loginMutation, runWithLoading],
  );

  const register = useCallback(
    async (data: RegisterRequest) =>
      runWithLoading(async () => {
        const response = await registerMutation.mutateAsync(data);
        if (response.success) {
          return { success: true, message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS };
        }
        return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
      }),
    [registerMutation, runWithLoading],
  );

  const verifyOTP = useCallback(
    async (data: OTPVerificationRequest) =>
      runWithLoading(async () => mapVerifyResult(await verifyOTPMutation.mutateAsync(data))),
    [verifyOTPMutation, runWithLoading],
  );

  const logout = useCallback(
    async () =>
      runWithLoading(async () => {
        await logoutMutation.mutateAsync();
        return { success: true, message: SUCCESS_MESSAGES.LOGOUT_SUCCESS };
      }),
    [logoutMutation, runWithLoading],
  );

  const updateProfile = useCallback(
    async (data: Partial<User>) =>
      runWithLoading(async () => {
        const response = await updateProfileMutation.mutateAsync(data);
        if (response.success && response.data) {
          return { success: true, message: SUCCESS_MESSAGES.PROFILE_UPDATED };
        }
        return { success: false, message: response.error || ERROR_MESSAGES.UNKNOWN_ERROR };
      }),
    [updateProfileMutation, runWithLoading],
  );

  const getProfile = useCallback(
    async () =>
      runWithLoading(async () =>
        queryClient.fetchQuery({
          queryKey: queryKeys.auth.profile(),
          queryFn: () => authService.getProfile(),
        }),
      ),
    [queryClient, runWithLoading],
  );

  return {
    login,
    register,
    verifyOTP,
    logout,
    updateProfile,
    getProfile,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      verifyOTPMutation.isPending ||
      logoutMutation.isPending ||
      updateProfileMutation.isPending,
    userProfile: userProfile?.data,
    isLoadingProfile,
    loginError: loginMutation.error,
    registerError: registerMutation.error,
    verifyOTPError: verifyOTPMutation.error,
    logoutError: logoutMutation.error,
    updateProfileError: updateProfileMutation.error,
  };
};
