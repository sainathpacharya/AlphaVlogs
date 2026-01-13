declare module 'react-native-inappbrowser-reborn' {
  export interface InAppBrowserOptions {
    dismissButtonStyle?: string;
    preferredBarTintColor?: string;
    preferredControlTintColor?: string;
    readerMode?: boolean;
    animated?: boolean;
    modalPresentationStyle?: string;
    modalTransitionStyle?: string;
    modalEnabled?: boolean;
    enableBarCollapsing?: boolean;
    showTitle?: boolean;
    toolbarColor?: string;
    secondaryToolbarColor?: string;
    navigationBarColor?: string;
    navigationBarDividerColor?: string;
    enableUrlBarHiding?: boolean;
    enableDefaultShare?: boolean;
    forceCloseOnRedirection?: boolean;
    showInRecents?: boolean;
    includeReferrer?: boolean;
    hasBackButton?: boolean;
    browserPackage?: string;
    showProgress?: boolean;
    animationStartPosition?: 'top' | 'bottom';
    headers?: Record<string, string>;
    waitForRedirectDelay?: number;
    hasShareButton?: boolean;
    shareSubject?: string;
    isInvisible?: boolean;
    isHidden?: boolean;
  }

  export function open(url: string, options?: InAppBrowserOptions): Promise<any>;
  export function close(): Promise<void>;
  export function isAvailable(): Promise<boolean>;
}
