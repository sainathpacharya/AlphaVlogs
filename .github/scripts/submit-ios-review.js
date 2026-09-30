#!/usr/bin/env node
/**
 * Submit the latest processed TestFlight build of Alpha Vlogs for App Review.
 *
 * Uses the App Store Connect API (APPLE_KEY_ID, APPLE_ISSUER_ID, APPLE_PRIVATE_KEY).
 * Does not upload a new binary. Picks the highest marketing version (then highest
 * build), cancels an open Waiting for Review submission when a newer version must
 * replace it, refreshes review notes for the paused paywall, and submits.
 *
 * Optional overrides: TARGET_VERSION, TARGET_BUILD
 */
'use strict';

const crypto = require('crypto');
const https = require('https');

const BUNDLE_ID = process.env.IOS_BUNDLE_ID || 'com.nsnr.alphavlogsindia';
const TARGET_VERSION = (process.env.TARGET_VERSION || '').trim();
const TARGET_BUILD = (process.env.TARGET_BUILD || '').trim();
const API = 'https://api.appstoreconnect.apple.com/v1';

const EDITABLE_STATES = new Set([
  'PREPARE_FOR_SUBMISSION',
  'DEVELOPER_REJECTED',
  'REJECTED',
  'METADATA_REJECTED',
  'INVALID_BINARY',
]);

const IN_REVIEW_STATES = new Set([
  'WAITING_FOR_REVIEW',
  'IN_REVIEW',
  'PROCESSING_FOR_APP_STORE',
]);

const CANCELABLE_SUBMISSION_STATES = new Set([
  'READY_FOR_REVIEW',
  'WAITING_FOR_REVIEW',
  'UNRESOLVED_ISSUES',
]);

const OPEN_SUBMISSION_STATES = new Set([
  'READY_FOR_REVIEW',
  'WAITING_FOR_REVIEW',
  'IN_REVIEW',
  'UNRESOLVED_ISSUES',
]);

function parseSemver(version) {
  const match = String(version || '')
    .trim()
    .match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
  };
}

function compareSemver(left, right) {
  const a = parseSemver(left);
  const b = parseSemver(right);
  if (!a && !b) {
    return 0;
  }
  if (!a) {
    return -1;
  }
  if (!b) {
    return 1;
  }
  if (a.major !== b.major) {
    return a.major - b.major;
  }
  if (a.minor !== b.minor) {
    return a.minor - b.minor;
  }
  return a.patch - b.patch;
}

function compareBuilds(left, right) {
  const versionDelta = compareSemver(left.marketingVersion, right.marketingVersion);
  if (versionDelta !== 0) {
    return versionDelta;
  }
  return Number(left.buildNumber) - Number(right.buildNumber);
}

const REVIEW_NOTES = [
  'This version does not include in-app purchases. Premium subscription is hidden, and video upload shows that uploads are paused and will resume shortly.',
  'Login is a mobile number plus an SMS one-time password. There is no username and password.',
  'Privacy Policy: https://alphavlogs.com/privacy-policy',
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
            const details = (json && json.errors) || [];
            const summary = details
              .map(error =>
                [error.title, error.detail].filter(Boolean).join(': '),
              )
              .join('\n');
            reject(
              new Error(
                `${method} ${url} failed (${response.statusCode})${summary ? `\n${summary}` : text ? `\n${text.slice(0, 800)}` : ''}`,
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

function notesDescribeLivePurchase(notes) {
  const text = String(notes || '');
  return (
    /annual premium/i.test(text) ||
    /com\.nsnr\.alphavlogsindia\.annual\.premium/.test(text) ||
    /subscribe/i.test(text)
  );
}

async function main() {
  const issuerId = (process.env.APPLE_ISSUER_ID || '').trim();
  const keyId = (process.env.APPLE_KEY_ID || '').trim();
  const privateKey = normalizeP8(process.env.APPLE_PRIVATE_KEY || '');
  if (!issuerId || !keyId || !privateKey) {
    fail('Missing APPLE_ISSUER_ID, APPLE_KEY_ID, or APPLE_PRIVATE_KEY');
  }

  const headers = {Authorization: `Bearer ${appleJwt({issuerId, keyId, privateKey})}`};

  const apps = await httpsJson(
    `${API}/apps?filter[bundleId]=${encodeURIComponent(BUNDLE_ID)}&limit=1`,
    {headers},
  );
  const app = apps.data?.[0];
  if (!app) {
    fail(`No App Store Connect app found for ${BUNDLE_ID}`);
  }
  const appId = app.id;
  console.log(`App: ${app.attributes?.name || BUNDLE_ID} (${appId})`);

  const buildsResponse = await httpsJson(
    `${API}/builds?filter[app]=${appId}&filter[processingState]=VALID&include=preReleaseVersion&sort=-uploadedDate&limit=50`,
    {headers},
  );
  const preReleaseById = new Map(
    (buildsResponse.included || [])
      .filter(item => item.type === 'preReleaseVersions')
      .map(item => [item.id, item]),
  );
  const builds = (buildsResponse.data || []).map(build => {
    const preReleaseId = build.relationships?.preReleaseVersion?.data?.id;
    const preRelease = preReleaseById.get(preReleaseId);
    return {
      id: build.id,
      buildNumber: String(build.attributes?.version || ''),
      marketingVersion: preRelease?.attributes?.version || '',
      uploadedDate: build.attributes?.uploadedDate || '',
      usesNonExemptEncryption: build.attributes?.usesNonExemptEncryption,
    };
  });
  for (const build of [...builds].sort(compareBuilds).reverse().slice(0, 8)) {
    console.log(
      `TestFlight ${build.marketingVersion} (${build.buildNumber}) uploaded ${build.uploadedDate}`,
    );
  }

  let latestBuild;
  if (TARGET_VERSION || TARGET_BUILD) {
    latestBuild = builds.find(build => {
      if (TARGET_VERSION && build.marketingVersion !== TARGET_VERSION) {
        return false;
      }
      if (TARGET_BUILD && build.buildNumber !== TARGET_BUILD) {
        return false;
      }
      return true;
    });
    if (!latestBuild) {
      fail(
        `No VALID build matches TARGET_VERSION=${TARGET_VERSION || '*'} TARGET_BUILD=${TARGET_BUILD || '*'}`,
      );
    }
  } else {
    latestBuild = [...builds].sort(compareBuilds).pop();
  }

  if (!latestBuild) {
    fail('No processed (VALID) TestFlight build found to submit');
  }
  console.log(
    `Selected build: ${latestBuild.marketingVersion} (${latestBuild.buildNumber}) uploaded ${latestBuild.uploadedDate}`,
  );

  if (latestBuild.usesNonExemptEncryption == null) {
    await httpsJson(`${API}/builds/${latestBuild.id}`, {
      method: 'PATCH',
      headers,
      body: {
        data: {
          type: 'builds',
          id: latestBuild.id,
          attributes: {usesNonExemptEncryption: false},
        },
      },
    });
    console.log('Set usesNonExemptEncryption=false on the build');
  }

  const versionsResponse = await httpsJson(
    `${API}/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=15`,
    {headers},
  );
  let versions = (versionsResponse.data || []).map(version => ({
    id: version.id,
    versionString: version.attributes?.versionString,
    state: version.attributes?.appStoreState,
    buildId: version.relationships?.build?.data?.id || null,
  }));
  for (const version of versions) {
    console.log(
      `Version ${version.versionString}: ${version.state}${version.buildId ? ` build=${version.buildId}` : ''}`,
    );
  }

  await cancelOpenReviewSubmissions(headers, appId);

  // Refresh version states after a cancel (Waiting for Review → Developer Rejected).
  const refreshedVersions = await httpsJson(
    `${API}/apps/${appId}/appStoreVersions?filter[platform]=IOS&limit=15`,
    {headers},
  );
  versions = (refreshedVersions.data || []).map(version => ({
    id: version.id,
    versionString: version.attributes?.versionString,
    state: version.attributes?.appStoreState,
    buildId: version.relationships?.build?.data?.id || null,
  }));

  let version = versions.find(item => item.versionString === latestBuild.marketingVersion);
  if (version && IN_REVIEW_STATES.has(version.state)) {
    console.log(
      `Version ${version.versionString} is already ${version.state}. Nothing to submit.`,
    );
    return;
  }
  if (version && !EDITABLE_STATES.has(version.state)) {
    fail(
      `Version ${version.versionString} is ${version.state} and cannot be submitted from this state.`,
    );
  }
  if (!version) {
    const blocking = versions.find(
      item =>
        item.state === 'PREPARE_FOR_SUBMISSION' &&
        item.versionString !== latestBuild.marketingVersion,
    );
    if (blocking) {
      fail(
        `Cannot create ${latestBuild.marketingVersion} while ${blocking.versionString} is ${blocking.state}. Remove or replace that version in App Store Connect first.`,
      );
    }
    const created = await httpsJson(`${API}/appStoreVersions`, {
      method: 'POST',
      headers,
      body: {
        data: {
          type: 'appStoreVersions',
          attributes: {
            platform: 'IOS',
            versionString: latestBuild.marketingVersion,
          },
          relationships: {
            app: {data: {type: 'apps', id: appId}},
          },
        },
      },
    });
    version = {
      id: created.data.id,
      versionString: created.data.attributes?.versionString,
      state: created.data.attributes?.appStoreState,
      buildId: null,
    };
    console.log(`Created version ${version.versionString} (${version.id})`);
  }

  if (version.buildId !== latestBuild.id) {
    await httpsJson(`${API}/appStoreVersions/${version.id}`, {
      method: 'PATCH',
      headers,
      body: {
        data: {
          type: 'appStoreVersions',
          id: version.id,
          relationships: {
            build: {data: {type: 'builds', id: latestBuild.id}},
          },
        },
      },
    });
    console.log(`Attached build ${latestBuild.buildNumber} to ${version.versionString}`);
  } else {
    console.log(`Build ${latestBuild.buildNumber} is already attached`);
  }

  await updateReviewNotes(headers, version.id);

  const submissionsResponse = await httpsJson(
    `${API}/apps/${appId}/reviewSubmissions?filter[platform]=IOS&limit=10`,
    {headers},
  );
  let submission = (submissionsResponse.data || []).find(item =>
    OPEN_SUBMISSION_STATES.has(item.attributes?.state),
  );

  if (
    submission &&
    submission.attributes?.state === 'IN_REVIEW' &&
    versions.find(item => item.id === version.id && IN_REVIEW_STATES.has(item.state))
  ) {
    console.log(`Review submission ${submission.id} is already IN_REVIEW.`);
    return;
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
    console.log(
      `Created review submission ${submission.id} (${submission.attributes?.state})`,
    );
  } else {
    console.log(
      `Using review submission ${submission.id} (${submission.attributes?.state})`,
    );
  }

  const itemsResponse = await httpsJson(
    `${API}/reviewSubmissions/${submission.id}/items?include=appStoreVersion&limit=20`,
    {headers},
  );
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
    console.log(`Added version ${version.versionString} to the review submission`);
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
    `Submitted ${version.versionString} (${latestBuild.buildNumber}) for App Review. State: ${submitted.data?.attributes?.state}`,
  );
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
  }
}

async function updateReviewNotes(headers, versionId) {
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

  const existingNotes = detail?.attributes?.notes || '';
  if (existingNotes && !notesDescribeLivePurchase(existingNotes)) {
    console.log('Kept existing App Review notes');
    return;
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
    console.log('Updated App Review notes for the paused paywall');
    return;
  }

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
  console.log('Added App Review notes for the paused paywall');
}

main().catch(error => {
  fail(error && error.stack ? error.stack : String(error));
});
