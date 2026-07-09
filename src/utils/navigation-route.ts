import type {NavigationState, PartialState} from '@react-navigation/native';

/**
 * Resolves the deepest active route name from a nested navigation state.
 * e.g. Root → App → Dashboard returns "Dashboard", not "App".
 */
export function getActiveRouteName(
  state: NavigationState | PartialState<NavigationState> | undefined,
): string | undefined {
  if (!state?.routes?.length) {
    return undefined;
  }

  const index = state.index ?? 0;
  const route = state.routes[index];

  if (!route) {
    return undefined;
  }

  if (route.state) {
    return getActiveRouteName(route.state);
  }

  return route.name;
}
