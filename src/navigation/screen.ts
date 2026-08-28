import type {ComponentType} from 'react';

/**
 * Ensures a screen component has a PascalCase function name for React Navigation.
 * Hermes/minified bundles can strip arrow-function names (e.g. to "f"), which
 * triggers navigation warnings even when the source component is named correctly.
 */
export function screen(
  Component: ComponentType<any>,
  displayName: string,
): ComponentType<any> {
  if (/^[A-Z]/.test(Component.name)) {
    return Component;
  }

  Object.defineProperty(Component, 'name', {
    value: displayName,
    configurable: true,
  });

  return Component;
}
