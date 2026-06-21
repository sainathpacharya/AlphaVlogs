import AsyncStorage from '@react-native-async-storage/async-storage';
import {STORAGE_KEYS} from '@/constants';
import {useUserCachedStore} from '@/stores/user-cached-store';
import {useUserStore} from '@/stores/user-store';
import {AuthTokens, User} from '@/types';

/** Persist tokens + user and mark the session authenticated. */
export async function persistLoginSession(
  user: User,
  tokens: AuthTokens,
): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.AUTH_TOKENS, JSON.stringify(tokens));
  await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  await useUserCachedStore.getState().setTokens(tokens);
  useUserCachedStore.getState().setUserData(user);
  const {setUser, setAuthenticated} = useUserStore.getState();
  setUser(user);
  setAuthenticated(true);
}
