#!/usr/bin/env node
/**
 * Clean Premium marketing copy from the waiting App Store version while keeping
 * the required Terms of Use (EULA) footer if Annual Premium still exists in ASC.
 */
'use strict';

const crypto = require('crypto');
const https = require('https');

const BUNDLE_ID = process.env.IOS_BUNDLE_ID || 'com.nsnr.alphavlogsindia';
const TARGET_VERSION = process.env.TARGET_VERSION || '1.0.4';
const API = 'https://api.appstoreconnect.apple.com/v1';

const EULA_URL = 'https://www.apple.com/legal/internet-services/itunes/dev/stdeula/';
const PRIVACY_URL = 'https://alphavlogs.com/privacy-policy';

const PROMOTIONAL_TEXT =
  'Join school talent events, upload performances, and switch student profiles from one mobile number.';

const DESCRIPTION = `Alpha Vlogs is a student talent platform where kids discover school events, showcase performances, and grow with confidence.

Built for students, parents, and schools, Alpha Vlogs makes it easy to join creative competitions — from singing and dance to comedy, rhymes, cooking, crafts, and more.

WHAT YOU CAN DO
• Sign in securely with mobile OTP
• Browse curated talent events on your dashboard
• Upload performance videos for open events
• Switch between linked student profiles on the same mobile number
• Manage your profile and account in one place

WHY ALPHA VLOGS
• Designed for school events and student competitions
• Simple flows for students and parents
• A safe space to learn, perform, and be recognized
• Categories for every kind of talent — solo, group, family, and special acts

Whether you’re preparing a rhyme, a dance, a comedy skit, or a special talent act, Alpha Vlogs helps you participate with ease and shine on a trusted digital stage.

Need help? Contact support@alphavlogs.com

Premium purchases are temporarily unavailable in this version. App Store Connect may still list Annual Premium for a later release. Annual Premium is an auto-renewable subscription. Length: 1 year. Price is shown in the app before purchase when available (localized App Store price; ₹100/year in India). Payment is charged to your Apple ID at confirmation of purchase and renews unless cancelled at least 24 hours before the end of the current period. Terms of Use (EULA): ${EULA_URL} Privacy Policy: ${PRIVACY_URL}`;

const REVIEW_NOTES = [
  'Premium purchases are temporarily unavailable in this build. The Premium paywall is hidden, and video upload shows that uploads are paused and will resume shortly.',
  'App Store Connect still lists Annual Premium (com.nsnr.alphavlogsindia.annual.premium) for a later release. Terms of Use (EULA) remains in the App Description: ' +
    EULA_URL,
  'Login is a mobile number plus an SMS one-time password. There is no username and password.',
  'Privacy Policy: ' + PRIVACY_URL,
].join('\n\n');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function base64url(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function normalizeP8(raw) {
  let key = String(raw || '')
    .trim()
    .replace(/\\n/g, '\n');
  if (!key) {
    return '';
  }
  if (!key.includes('BEGIN')) {
    const body = key.replace(/\s+/g, '');
    key = `-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`;
  }
  return key;
}

function appleJwt({issuerId, keyId, privateKey}) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({alg: 'ES256', kid: keyId, typ: 'JWT'}));
  const payload = base64url(
    JSON.stringify({
      iss: issuerId,
      iat: now,
      exp: now + 20 * 60,
      aud: 'appstoreconnect-v1',
    }),
  );
  const unsigned = `${header}.${payload}`;
  const signature = crypto.sign('sha256', Buffer.from(unsigned), {
    key: crypto.createPrivateKey(privateKey),
    dsaEncoding: 'ieee-p1363',
  });
  return `${unsigned}.${base64url(signature)}`;
}

function httpsJson(url, {method = 'GET', headers = {}, body} = {}) {
  const payload =
    body == null ? null : typeof body === 'string' ? body : JSON.stringify(body);
  return new Promise((resolve, reject) => {
    const requestHeaders = {...headers};
    if (payload != null) {
      requestHeaders['Content-Type'] =
        requestHeaders['Content-Type'] || 'application/json';
      requestHeaders['Content-Length'] = Buffer.byteLength(payload);
    }
    const request = https.request(
      url,
      {method, headers: requestHeaders},
      response => {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          if (text) {
            try {
              json = JSON.parse(text);
            } catch (_error) {
              reject(
                new Error(
                  `${method} ${url} returned non-JSON (${response.statusCode}): ${text.slice(0, 500)}`,
                ),
              );
              return;
            }
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                `${method} ${url} failed (${response.statusCode}): ${text.slice(0, 1000)}`,
              ),
            );
            return;
          }
          resolve(json);
        });
      },
    );
    request.on('error', reject);
    if (payload != null) {
      request.write(payload);
    }
    request.end();
  });
}

async function main() {
  const issuerId = (process.env.APPLE_ISSUER_ID || '').trim();
  const keyId = (process.env.APPLE_KEY_ID || '').trim();
  const privateKey = normalizeP8(process.env.APPLE_PRIVATE_KEY || '');
  if (!issuerId || !keyId || !privateKey) {
    fail('Missing APPLE_ISSUER_ID, APPLE_KEY_ID, or APPLE_PRIVATE_KEY');
  }
  const headers = {
    Authorization: `Bearer ${appleJwt({issuerId, keyId, privateKey})}`,
  };

  const apps = await httpsJson(
    `${API}/apps?filter[bundleId]=${encodeURIComponent(BUNDLE_ID)}&limit=1`,
    {headers},
  );
  const app = apps.data?.[0];
  if (!app) {
    fail(`No app for ${BUNDLE_ID}`);
  }

  const versions = await httpsJson(
    `${API}/apps/${app.id}/appStoreVersions?filter[platform]=IOS&limit=15`,
    {headers},
  );
  const version = (versions.data || []).find(
    item => item.attributes?.versionString === TARGET_VERSION,
  );
  if (!version) {
    fail(`Version ${TARGET_VERSION} not found`);
  }
  console.log(
    `Updating ${TARGET_VERSION} (${version.attributes?.appStoreState}) ${version.id}`,
  );

  const locs = await httpsJson(
    `${API}/appStoreVersions/${version.id}/appStoreVersionLocalizations?limit=20`,
    {headers},
  );
  for (const locale of locs.data || []) {
    const localeCode = locale.attributes?.locale || locale.id;
    await httpsJson(`${API}/appStoreVersionLocalizations/${locale.id}`, {
      method: 'PATCH',
      headers,
      body: {
        data: {
          type: 'appStoreVersionLocalizations',
          id: locale.id,
          attributes: {
            promotionalText: PROMOTIONAL_TEXT,
            description: DESCRIPTION,
          },
        },
      },
    });
    console.log(`Updated promotional text + description for ${localeCode}`);
  }

  let detail;
  try {
    const response = await httpsJson(
      `${API}/appStoreVersions/${version.id}/appStoreReviewDetail`,
      {headers},
    );
    detail = response.data;
  } catch (error) {
    if (!String(error.message).includes('(404)')) {
      throw error;
    }
  }
  if (detail?.id) {
    await httpsJson(`${API}/appStoreReviewDetails/${detail.id}`, {
      method: 'PATCH',
      headers,
      body: {
        data: {
          type: 'appStoreReviewDetails',
          id: detail.id,
          attributes: {notes: REVIEW_NOTES},
        },
      },
    });
    console.log('Updated App Review notes');
  } else {
    await httpsJson(`${API}/appStoreReviewDetails`, {
      method: 'POST',
      headers,
      body: {
        data: {
          type: 'appStoreReviewDetails',
          attributes: {notes: REVIEW_NOTES},
          relationships: {
            appStoreVersion: {
              data: {type: 'appStoreVersions', id: version.id},
            },
          },
        },
      },
    });
    console.log('Created App Review notes');
  }

  console.log('Done. Refresh App Store Connect — no resubmit needed for metadata-only edits while Waiting for Review.');
}

main().catch(error => fail(error.stack || String(error)));
