import { linkingUrlSchemes } from '@/utils/constants';
import { getBase64 } from '@/utils/handleFiles';
import logger from '@/utils/logger';
import { Alert, Linking } from 'react-native';
import Share from 'react-native-share';
import { WebView, WebViewProps } from 'react-native-webview';

type CustomWebViewProps = Omit<
  WebViewProps,
  'onShouldStartLoadWithRequest' | 'originWhitelist'
>;

const CHWebView = (props: CustomWebViewProps) => {
  const injectedJS = `
    document.addEventListener('click', function(event) {
      let target = event.target;
      while (target && target.tagName !== 'A') {
        target = target.parentElement;
      }
      if (target && target.tagName === 'A') {
        const href = target.href.toLowerCase();
        if (href.startsWith('blob:') || href.startsWith('data:') || href.includes('download.')) {
          event.preventDefault();
          window.ReactNativeWebView.postMessage(target.href);
        }
      }
    });
  `;

  const handleNavigation = (event: any) => {
    const url = event.nativeEvent.data;

    if (
      url.includes('blob:') ||
      url.includes('data:') ||
      url.toLowerCase().includes('download.')
    ) {
      if (url.includes('data:')) {
        Share.open({
          url,
        });
        return false;
      }
      if (url.includes('download.') || url.startsWith('blob:')) {
        const targetUrl = url
          ?.replace('http://', 'https://')
          .replace('blob:', '');
        getBase64(targetUrl)
          .then((response) => {
            Share.open({
              url: `data:application/pdf;base64,${response}`,
            });
          })
          .catch((error) => {
            logger.debug('Error', error);
          });
        return false;
      }
    }
  };

  return (
    <WebView
      {...props}
      originWhitelist={['*']}
      setSupportMultipleWindows={false}
      injectedJavaScript={injectedJS}
      onMessage={handleNavigation}
      onShouldStartLoadWithRequest={(request) => {
        const { url } = request;
        if (url.startsWith('data:') || url.toLowerCase().includes('download')) {
          return false;
        }

        if (request.url.startsWith('http://')) {
          Alert.alert('This link is not secure');
          return false;
        }

        if (linkingUrlSchemes.some((scheme) => url.startsWith(scheme))) {
          Linking.openURL(url);
          return false;
        }

        return true;
      }}
    />
  );
};

export default CHWebView;
