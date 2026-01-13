declare module 'react-native-share' {
  export interface ShareOptions {
    title?: string;
    message?: string;
    url?: string;
  }

  export function share(options: ShareOptions): Promise<any>;
  export default { share };
}
