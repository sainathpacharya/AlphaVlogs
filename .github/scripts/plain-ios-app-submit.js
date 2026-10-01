#!/usr/bin/env node
/**
 * Strip subscriptions from App Store Connect and resubmit 1.0.4 as a plain app.
 *
 * - Deletes READY_TO_SUBMIT / undeleted subscriptions when the API allows
 * - Otherwise clears them from sale / removes from the review submission
 * - Rewrites App Description, promotional text, and review notes with no IAP copy
 * - Removes the version from review if needed, then resubmits
 */
'use strict';

const crypto = require('crypto');
const https = require('https');

const BUNDLE_ID = process.env.IOS_BUNDLE_ID || 'com.nsnr.alphavlogsindia';
const TARGET_VERSION = process.env.TARGET_VERSION || '1.0.4';
const TARGET_BUILD = (process.env.TARGET_BUILD || '51').trim();
const API = 'https://api.appstoreconnect.apple.com/v1';

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

Privacy Policy: ${PRIVACY_URL}`;

const REVIEW_NOTES = [
  'This submission is a plain app with no in-app purchases and no auto-renewable subscriptions.',
  'Premium / Annual Premium purchase UI is not offered. Video uploads may show a temporary pause message.',
  'Login is a mobile number plus an SMS one-time password. There is no username and password.',
  `Privacy Policy: ${PRIVACY_URL}`,
].join('\n\n');

const IN_REVIEW_STATES = new Set([
  'WAITING_FOR_REVIEW',
  'IN_REVIEW',
  'PROCESSING_FOR_APP_STORE',
]);

const CANCELABLE_SUBMISSION_STATES = new Set([
  'WAITING_FOR_REVIEW',
  'UNRESOLVED_ISSUES',
]);

const OPEN_SUBMISSION_STATES = new Set([
  'READY_FOR_REVIEW',
  'WAITING_FOR_REVIEW',
  'IN_REVIEW',
  'UNRESOLVED_ISSUES',
]);

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
                `${method} ${url} failed (${response.statusCode}): ${text.slice(0, 1200)}`,
              ),
            );
            return;
          }
          resolve(json || {});
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

async function cancelOpenReviewSubmissions(headers, appId) {
  const submissionsResponse = await httpsJson(
    `${API}/apps/${appId}/reviewSubmissions?filter[platform]=IOS&limit=20`,
    {headers},
  );
  for (const submission of submissionsResponse.data || []) {
    const state = submission.attributes?.state;
    console.log(`Review submission ${submission.id}: ${state}`);
    if (!CANCELABLE_SUBMISSION_STATES.has(state)) {
      continue;
    }
    try {
      await httpsJson(`${API}/reviewSubmissions/${submission.id}`, {
        method: 'PATCH',
        headers,
        body: {
          data: {
            type: 'reviewSubmissions',
            id: submission.id,
            attributes: {canceled: true},
          },
        },
      });
      console.log(`Canceled review submission ${submission.id}`);
    } catch (error) {
      console.log(`Could not cancel ${submission.id}: ${error.message}`);
    }
  }
}

async function removeSubscriptions(headers, appId) {
  const groups = await httpsJson(
    `${API}/apps/${appId}/subscriptionGroups?limit=20`,
    {headers},
  );
  if (!(groups.data || []).length) {
    console.log('No subscription groups found');
    return;
  }

  for (const group of groups.data || []) {
    console.log(`Subscription group: ${group.attributes?.referenceName || group.id}`);
    const subs = await httpsJson(
      `${API}/subscriptionGroups/${group.id}/subscriptions?limit=50`,
      {headers},
    );
    for (const sub of subs.data || []) {
      const name = sub.attributes?.name;
      const productId = sub.attributes?.productId;
      const state = sub.attributes?.state;
      console.log(`  Subscription ${name} (${productId}) state=${state}`);

      // Prefer hard-delete for never-approved products.
      try {
        await httpsJson(`${API}/subscriptions/${sub.id}`, {
          method: 'DELETE',
          headers,
        });
        console.log(`  Deleted subscription ${productId}`);
        continue;
      } catch (error) {
        console.log(`  Delete failed for ${productId}: ${error.message}`);
      }

      // Fallback: stop offering in new territories / mark not for sale if supported.
      try {
        await httpsJson(`${API}/subscriptions/${sub.id}`, {
          method: 'PATCH',
          headers,
          body: {
            data: {
              type: 'subscriptions',
              id: sub.id,
              attributes: {
                availableInNewTerritories: false,
              },
            },
          },
        });
        console.log(`  Set availableInNewTerritories=false for ${productId}`);
      } catch (error) {
        console.log(`  Could not update availability for ${productId}: ${error.message}`);
      }

      try {
        const availability = await httpsJson(
          `${API}/subscriptions/${sub.id}/subscriptionAvailability?include=availableTerritories`,
          {headers},
        );
        const availabilityId = availability.data?.id;
        if (availabilityId) {
          await httpsJson(`${API}/subscriptionAvailabilities/${availabilityId}`, {
            method: 'PATCH',
            headers,
            body: {
              data: {
                type: 'subscriptionAvailabilities',
                id: availabilityId,
                attributes: {
                  availableInNewTerritories: false,
                },
                relationships: {
                  availableTerritories: {data: []},
                },
              },
            },
          });
          console.log(`  Cleared territories for ${productId}`);
        }
      } catch (error) {
        console.log(`  Could not clear territories for ${productId}: ${error.message}`);
      }
    }

    // Try deleting empty-ish groups after products are gone.
    try {
      await httpsJson(`${API}/subscriptionGroups/${group.id}`, {
        method: 'DELETE',
        headers,
      });
      console.log(`Deleted subscription group ${group.attributes?.referenceName || group.id}`);
    } catch (error) {
      console.log(
        `Could not delete subscription group ${group.attributes?.referenceName || group.id}: ${error.message}`,
      );
    }
  }
}

async function updatePlainMetadata(headers, versionId) {
  const locs = await httpsJson(
    `${API}/appStoreVersions/${versionId}/appStoreVersionLocalizations?limit=20`,
    {headers},
  );
  for (const locale of locs.data || []) {
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
    console.log(`Updated plain listing copy for ${locale.attributes?.locale}`);
  }

  let detail;
  try {
    const response = await httpsJson(
      `${API}/appStoreVersions/${versionId}/appStoreReviewDetail`,
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
              data: {type: 'appStoreVersions', id: versionId},
            },
          },
        },
      },
    });
  }
  console.log('Updated plain App Review notes');
}

async function attachBuild(headers, version, builds) {
  const target = builds.find(
    build =>
      build.marketingVersion === TARGET_VERSION &&
      (!TARGET_BUILD || build.buildNumber === TARGET_BUILD),
  ) || builds.find(build => build.marketingVersion === TARGET_VERSION);

  if (!target) {
    fail(`No VALID TestFlight build found for ${TARGET_VERSION}`);
  }
  if (version.buildId !== target.id) {
    await httpsJson(`${API}/appStoreVersions/${version.id}`, {
      method: 'PATCH',
      headers,
      body: {
        data: {
          type: 'appStoreVersions',
          id: version.id,
          relationships: {
            build: {data: {type: 'builds', id: target.id}},
          },
        },
      },
    });
    console.log(`Attached build ${target.buildNumber}`);
  } else {
    console.log(`Build ${target.buildNumber} already attached`);
  }
  return target;
}

async function submitVersion(headers, appId, version) {
  const submissionsResponse = await httpsJson(
    `${API}/apps/${appId}/reviewSubmissions?filter[platform]=IOS&limit=10`,
    {headers},
  );
  let submission = (submissionsResponse.data || []).find(item =>
    OPEN_SUBMISSION_STATES.has(item.attributes?.state),
  );

  if (submission && submission.attributes?.state === 'UNRESOLVED_ISSUES') {
    await cancelOpenReviewSubmissions(headers, appId);
    submission = null;
  }

  if (!submission || !OPEN_SUBMISSION_STATES.has(submission.attributes?.state)) {
    const created = await httpsJson(`${API}/reviewSubmissions`, {
      method: 'POST',
      headers,
      body: {
        data: {
          type: 'reviewSubmissions',
          attributes: {platform: 'IOS'},
          relationships: {
            app: {data: {type: 'apps', id: appId}},
          },
        },
      },
    });
    submission = created.data;
    console.log(`Created review submission ${submission.id}`);
  } else {
    console.log(
      `Using review submission ${submission.id} (${submission.attributes?.state})`,
    );
  }

  const itemsResponse = await httpsJson(
    `${API}/reviewSubmissions/${submission.id}/items?include=appStoreVersion&limit=50`,
    {headers},
  );
  // Drop any IAP/subscription items from the open submission when possible.
  for (const item of itemsResponse.data || []) {
    const type =
      item.relationships?.appStoreVersion?.data?.type ||
      item.relationships?.appStoreVersionExperiment?.data?.type ||
      '';
    const relatedSub = item.relationships?.appCustomProductPage?.data;
    const relatedIap =
      item.relationships?.inAppPurchase?.data ||
      item.relationships?.subscription?.data;
    if (relatedIap) {
      try {
        await httpsJson(`${API}/reviewSubmissionItems/${item.id}`, {
          method: 'DELETE',
          headers,
        });
        console.log(`Removed IAP/subscription item ${item.id} from submission`);
      } catch (error) {
        console.log(`Could not remove submission item ${item.id}: ${error.message}`);
      }
    }
    void type;
    void relatedSub;
  }

  const alreadyAdded = (itemsResponse.data || []).some(
    item => item.relationships?.appStoreVersion?.data?.id === version.id,
  );
  if (!alreadyAdded) {
    await httpsJson(`${API}/reviewSubmissionItems`, {
      method: 'POST',
      headers,
      body: {
        data: {
          type: 'reviewSubmissionItems',
          relationships: {
            reviewSubmission: {
              data: {type: 'reviewSubmissions', id: submission.id},
            },
            appStoreVersion: {
              data: {type: 'appStoreVersions', id: version.id},
            },
          },
        },
      },
    });
    console.log(`Added version ${version.versionString} to submission`);
  }

  const submitted = await httpsJson(`${API}/reviewSubmissions/${submission.id}`, {
    method: 'PATCH',
    headers,
    body: {
      data: {
        type: 'reviewSubmissions',
        id: submission.id,
        attributes: {submitted: true},
      },
    },
  });
  console.log(
    `Submitted ${version.versionString} as a plain app. State: ${submitted.data?.attributes?.state}`,
  );
}

async function main() {
  const issuerId = (process.env.APPLE_ISSUER_ID || '').trim();
  const keyId = (process.env.APPLE_KEY_ID || '').trim();
  const privateKey = normalizeP8(process.env.APPLE_PRIVATE_KEY || '');
  if (!issuerId || !keyId || !privateKey) {
    fail('Missing Apple API credentials');
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
  console.log(`App: ${app.attributes?.name} (${app.id})`);

  console.log('\n## Remove subscriptions');
  await removeSubscriptions(headers, app.id);

  const versionsResponse = await httpsJson(
    `${API}/apps/${app.id}/appStoreVersions?filter[platform]=IOS&include=build&limit=15`,
    {headers},
  );
  let version = (versionsResponse.data || [])
    .map(item => ({
      id: item.id,
      versionString: item.attributes?.versionString,
      state: item.attributes?.appStoreState,
      buildId: item.relationships?.build?.data?.id || null,
    }))
    .find(item => item.versionString === TARGET_VERSION);
  if (!version) {
    fail(`Version ${TARGET_VERSION} not found`);
  }
  console.log(`\n## Version ${version.versionString}: ${version.state}`);

  if (IN_REVIEW_STATES.has(version.state)) {
    console.log('Removing version from review so subscription cleanup can apply');
    await cancelOpenReviewSubmissions(headers, app.id);
    const refreshed = await httpsJson(`${API}/appStoreVersions/${version.id}`, {
      headers,
    });
    version.state = refreshed.data?.attributes?.appStoreState || version.state;
    console.log(`Version state after cancel: ${version.state}`);
  }

  const buildsResponse = await httpsJson(
    `${API}/builds?filter[app]=${app.id}&filter[processingState]=VALID&include=preReleaseVersion&sort=-uploadedDate&limit=50`,
    {headers},
  );
  const preById = new Map(
    (buildsResponse.included || [])
      .filter(item => item.type === 'preReleaseVersions')
      .map(item => [item.id, item]),
  );
  const builds = (buildsResponse.data || []).map(build => {
    const pre = preById.get(build.relationships?.preReleaseVersion?.data?.id);
    return {
      id: build.id,
      buildNumber: String(build.attributes?.version || ''),
      marketingVersion: pre?.attributes?.version || '',
    };
  });
  const build = await attachBuild(headers, version, builds);

  console.log('\n## Plain listing metadata');
  await updatePlainMetadata(headers, version.id);

  console.log('\n## Resubmit plain app');
  await submitVersion(headers, app.id, version);
  console.log(
    `\nDone. ${TARGET_VERSION} (${build.buildNumber}) submitted without subscription marketing copy.`,
  );
}

main().catch(error => fail(error.stack || String(error)));
