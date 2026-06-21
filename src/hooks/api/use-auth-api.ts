import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import authService, {
  RegisterRequest,
  SendOTPRequest,
  VerifyOTPRequest,
} from '@/services/auth-service';
import { User } from '@/types';
import { queryKeys } from '@/lib/query-keys';
import { persistLoginSession } from '@/utils/auth-session';
import apiService from '@/services/api';
import { useUserCachedStore, useUserStore } from '@/stores';

async function persistLoginFromResponse(
  response: Awaited<ReturnType<typeof authService.selectProfile>>,
): Promise<boolean> {
  if (response.success && response.data) {
    await persistLoginSession(response.data.user, response.data.tokens);
    return true;
  }
  return false;
}

export function useSendOtpMutation() {
  return useMutation({
    mutationKey: queryKeys.auth.sendOtp(),
    mutationFn: (data: SendOTPRequest) => authService.sendOTP(data),
    retry: false,
  });
}

export function useVerifyOtpMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.auth.verifyOtp(),
    mutationFn: (data: VerifyOTPRequest) => authService.verifyOTP(data),
    retry: false,
    onSuccess: async response => {
      if (response.success && response.data?.tokens && response.data.user) {
        await persistLoginSession(response.data.user, response.data.tokens);
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
    },
  });
}

export function useSelectProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.auth.selectProfile(),
    mutationFn: (data: { studentId: number; mobile: string }) =>
      authService.selectProfile(data),
    onSuccess: async response => {
      if (await persistLoginFromResponse(response)) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
    },
  });
}

export function useStudentProfilesQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.auth.profiles(),
    queryFn: async () => {
      const response = await authService.listProfiles();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Unable to load profiles.');
      }
      return response.data.profiles;
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}

export function useSwitchProfileMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: queryKeys.auth.switchProfile(),
    mutationFn: (studentId: number) => authService.switchProfile({ studentId }),
    onSuccess: async response => {
      if (await persistLoginFromResponse(response)) {
        await queryClient.invalidateQueries({ queryKey: queryKeys.auth.all });
      }
    },
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationKey: queryKeys.auth.register(),
    mutationFn: (data: RegisterRequest) => authService.register(data),
  });
}

export function useLoginMutation() {
  return useVerifyOtpMutation();
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const { setAuthenticated, setUser } = useUserStore();
  const { clearAll } = useUserCachedStore();

  return useMutation({
    mutationKey: queryKeys.auth.logout(),
    mutationFn: () => authService.logout(),
    onSettled: async () => {
      await apiService.clearStoredAuth();
      await clearAll();
      setUser(null);
      setAuthenticated(false);
      queryClient.clear();
    },
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const { reset, setAuthenticated, setUser } = useUserStore();
  const { clearAll } = useUserCachedStore();

  return useMutation({
    mutationKey: queryKeys.auth.deleteAccount(),
    mutationFn: () => authService.deleteAccount(),
    onSuccess: async response => {
      if (response.success) {
        await apiService.clearStoredAuth();
        await clearAll();
        reset();
        setUser(null);
        setAuthenticated(false);
        queryClient.clear();
      }
    },
  });
}

export function useUpdateProfileMutation() {
  const queryClient = useQueryClient();
  const { setUser } = useUserStore();
  const { setUserData } = useUserCachedStore();

  return useMutation({
    mutationKey: [...queryKeys.auth.profile(), 'update'],
    mutationFn: (data: Partial<User>) => authService.updateProfile(data),
    onSuccess: response => {
      if (response.success && response.data) {
        setUserData(response.data);
        setUser(response.data);
        queryClient.invalidateQueries({ queryKey: queryKeys.auth.profile() });
      }
    },
  });
}

export function useProfileQuery(enabled = false) {
  return useQuery({
    queryKey: queryKeys.auth.profile(),
    queryFn: () => authService.getProfile(),
    enabled,
  });
}
