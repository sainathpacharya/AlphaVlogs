import {
  addSslPinningErrorListener,
  initializeSslPinning,
  isSslPinningAvailable,
} from 'react-native-ssl-public-key-pinning';
import { isMockMode } from '@/config/api-config';

/** Production API host (no scheme). */
export const SSL_PINNED_HOST = 'api.alphavlogs.com';

/**
 * Base64 SHA-256 SPKI hashes. Regenerate when rotating certs:
 *   echo | openssl s_client -servername api.alphavlogs.com -connect api.alphavlogs.com:443 2>/dev/null \
 *     | openssl x509 -pubkey -noout | openssl pkey -pubin -outform der \
 *     | openssl dgst -sha256 -binary | openssl enc -base64
 *
 * iOS requires at least two pins. Second pin: backup leaf or LE intermediate.
 */
export const SSL_PUBLIC_KEY_HASHES = [
  'NQ1K1SsiZ79ulQ9FFfA5GcpwTsYuwDsgA++l5dOd7RM=', // api.alphavlogs.com leaf (Jun 2026, LE YE2)
  's/tdAOmUzd8syaTuqfgGvFcn6DzA5Cmb+Vby1ST+U3Y=', // Let's Encrypt YE2 intermediate (backup)
] as const;

export const SSL_PINNING_CONFIG = {
  /** Off in __DEV__ so local http:// LAN backend is unaffected. */
  ENABLED: !__DEV__,
  HOST: SSL_PINNED_HOST,
  INCLUDE_SUBDOMAINS: true,
  /** After this date pinning is disabled (TrustKit); extend via app update. */
  EXPIRATION_DATE: '2027-07-30',
  PUBLIC_KEY_HASHES: [...SSL_PUBLIC_KEY_HASHES],
};

export async function bootstrapSslPinning(): Promise<void> {
  if (!SSL_PINNING_CONFIG.ENABLED || isMockMode()) {
    return;
  }

  if (!isSslPinningAvailable()) {
    if (__DEV__) {
      console.warn('[ssl-pinning] Native module unavailable; skipping.');
    }
    return;
  }

  const { HOST, INCLUDE_SUBDOMAINS, PUBLIC_KEY_HASHES, EXPIRATION_DATE } =
    SSL_PINNING_CONFIG;

  await initializeSslPinning({
    [HOST]: {
      includeSubdomains: INCLUDE_SUBDOMAINS,
      publicKeyHashes: PUBLIC_KEY_HASHES,
      expirationDate: EXPIRATION_DATE,
    },
  });

  if (__DEV__) {
    console.log(`[ssl-pinning] Enabled for ${HOST}`);
  }
}

/** Log pinning failures (e.g. MITM / wrong cert). Call once from App mount. */
export function subscribeSslPinningErrors(
  onError?: (hostname: string) => void,
): () => void {
  if (!isSslPinningAvailable()) {
    return () => {};
  }

  const subscription = addSslPinningErrorListener((error) => {
    if (__DEV__) {
      console.warn('[ssl-pinning] Pin mismatch:', error.serverHostname);
    }
    onError?.(error.serverHostname);
  });

  return () => subscription.remove();
}
