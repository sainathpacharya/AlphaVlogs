#!/usr/bin/env node
/**
 * Resolve the next store version for a production upload.
 *
 * Reads a base marketing version (tag, workflow input, git tag, or package.json),
 * then queries Google Play / App Store Connect and auto-bumps so the upload is
 * always higher than what is already on the store.
 *
 * Usage: node .github/scripts/resolve-store-version.js <android|ios>
 */
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const https = require('https');
const path = require('path');
const {execSync} = require('child_process');

const ROOT = path.resolve(__dirname, '../..');

function fail(message) {
  console.error(message);
  process.exit(1);
}

function writeOutput(values) {
  const lines = Object.entries(values).map(([key, value]) => `${key}=${value}`);
  for (const line of lines) {
    console.log(line);
  }
  if (process.env.GITHUB_OUTPUT) {
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `${lines.join('\n')}\n`);
  }
}

function parseSemver(version) {
  const match = String(version || '').trim().match(/^(\d+)\.(\d+)\.(\d+)$/);
  if (!match) {
    return null;
  }
  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    raw: `${Number(match[1])}.${Number(match[2])}.${Number(match[3])}`,
  };
}

function compareSemver(a, b) {
  const left = parseSemver(a);
  const right = parseSemver(b);
  if (!left && !right) {
    return 0;
  }
  if (!left) {
    return -1;
  }
  if (!right) {
    return 1;
  }
  if (left.major !== right.major) {
    return left.major - right.major;
  }
  if (left.minor !== right.minor) {
    return left.minor - right.minor;
  }
  return left.patch - right.patch;
}

function bumpPatch(version) {
  const parsed = parseSemver(version);
  if (!parsed) {
    fail(`Cannot bump invalid version '${version}'`);
  }
  return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
}

function semverToVersionCode(version) {
  const parsed = parseSemver(version);
  if (!parsed) {
    fail(`Cannot convert invalid version '${version}' to versionCode`);
  }
  return parsed.major * 1000000 + parsed.minor * 1000 + parsed.patch;
}

function maxSemver(...versions) {
  return versions
    .filter(version => parseSemver(version))
    .sort(compareSemver)
    .pop();
}

function base64url(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function httpsJson(url, {method = 'GET', headers = {}, body} = {}) {
  return new Promise((resolve, reject) => {
    const request = https.request(
      url,
      {method, headers},
      response => {
        const chunks = [];
        response.on('data', chunk => chunks.push(chunk));
        response.on('end', () => {
          const text = Buffer.concat(chunks).toString('utf8');
          let json = null;
          if (text) {
            try {
              json = JSON.parse(text);
            } catch (error) {
              reject(
                new Error(
                  `${method} ${url} returned non-JSON (${response.statusCode}): ${text.slice(0, 300)}`,
                ),
              );
              return;
            }
          }
          if (response.statusCode < 200 || response.statusCode >= 300) {
            reject(
              new Error(
                `${method} ${url} failed (${response.statusCode}): ${text.slice(0, 500)}`,
              ),
            );
            return;
          }
          resolve(json);
        });
      },
    );
    request.on('error', reject);
    if (body) {
      request.write(body);
    }
    request.end();
  });
}

function httpsForm(url, params) {
  const body = new URLSearchParams(params).toString();
  return httpsJson(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Content-Length': Buffer.byteLength(body),
    },
    body,
  });
}

function resolveBaseVersion() {
  const eventName = process.env.EVENT_NAME || process.env.GITHUB_EVENT_NAME || '';
  const ref = process.env.REF || process.env.GITHUB_REF || '';
  const refName = process.env.REF_NAME || process.env.GITHUB_REF_NAME || '';
  const input = (process.env.VERSION_INPUT || '').trim();

  if (eventName === 'push' && ref.startsWith('refs/tags/v')) {
    const fromTag = refName.replace(/^v/, '');
    console.log(`Version from tag: ${fromTag}`);
    return fromTag;
  }

  if (input) {
    console.log(`Version from workflow input: ${input}`);
    return input;
  }

  try {
    const latestTag = execSync('git describe --tags --abbrev=0', {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    if (latestTag.startsWith('v')) {
      const fromGit = latestTag.slice(1);
      console.log(`Version from latest tag: ${fromGit}`);
      return fromGit;
    }
  } catch (_error) {
    // No tags in this checkout.
  }

  const pkg = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8'));
  console.log(`Version from package.json: ${pkg.version}`);
  return pkg.version;
}

function nextMarketingVersion(baseVersion, storeVersion) {
  let next = parseSemver(baseVersion)?.raw;
  if (!next) {
    fail(`Invalid version '${baseVersion}'. Expected MAJOR.MINOR.PATCH (e.g. 1.0.3)`);
  }
  if (storeVersion && compareSemver(next, storeVersion) <= 0) {
    next = bumpPatch(maxSemver(next, storeVersion));
    console.log(
      `Auto-bumped marketing version ${baseVersion} -> ${next} (store already has ${storeVersion})`,
    );
  }
  return next;
}

function parseServiceAccount(raw) {
  if (!raw || !raw.trim()) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch (_error) {
    fail('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not valid JSON');
  }
}

async function googleAccessToken(serviceAccount) {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({alg: 'RS256', typ: 'JWT'}));
  const claim = base64url(
    JSON.stringify({
      iss: serviceAccount.client_email,
      scope: 'https://www.googleapis.com/auth/androidpublisher',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claim}`;
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(unsigned)
    .sign(serviceAccount.private_key);
  const assertion = `${unsigned}.${base64url(signature)}`;
  const token = await httpsForm('https://oauth2.googleapis.com/token', {
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion,
  });
  if (!token.access_token) {
    throw new Error('Google OAuth did not return an access token');
  }
  return token.access_token;
}

async function queryPlayStore(packageName) {
  const serviceAccount = parseServiceAccount(
    process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON || '',
  );
  if (!serviceAccount) {
    console.log('Play API skipped: GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is empty');
    return {versionName: null, versionCode: 0};
  }

  const accessToken = await googleAccessToken(serviceAccount);
  const authHeaders = {Authorization: `Bearer ${accessToken}`};
  const base = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(packageName)}`;
  const edit = await httpsJson(`${base}/edits`, {
    method: 'POST',
    headers: {
      ...authHeaders,
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  try {
    const tracks = await httpsJson(`${base}/edits/${edit.id}/tracks`, {
      headers: authHeaders,
    });
    let versionCode = 0;
    let versionName = null;
    for (const track of tracks.tracks || []) {
      for (const release of track.releases || []) {
        if (release.name && parseSemver(release.name)) {
          versionName = maxSemver(versionName, release.name) || versionName;
        }
        for (const code of release.versionCodes || []) {
          const numeric = Number(code);
          if (Number.isFinite(numeric) && numeric > versionCode) {
            versionCode = numeric;
          }
        }
      }
    }
    console.log(
      `Play Store latest: versionName=${versionName || 'none'} versionCode=${versionCode || 'none'}`,
    );
    return {versionName, versionCode};
  } finally {
    try {
      await httpsJson(`${base}/edits/${edit.id}`, {
        method: 'DELETE',
        headers: authHeaders,
      });
    } catch (_error) {
      // Best-effort cleanup of the unpublished edit.
    }
  }
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

async function queryAppStoreConnect(bundleId) {
  const issuerId = (process.env.APPLE_ISSUER_ID || '').trim();
  const keyId = (process.env.APPLE_KEY_ID || '').trim();
  const privateKey = normalizeP8(process.env.APPLE_PRIVATE_KEY || '');
  if (!issuerId || !keyId || !privateKey) {
    console.log('App Store Connect API skipped: missing Apple API credentials');
    return {versionName: null, buildNumber: 0};
  }

  const token = appleJwt({issuerId, keyId, privateKey});
  const headers = {Authorization: `Bearer ${token}`};
  const apps = await httpsJson(
    `https://api.appstoreconnect.apple.com/v1/apps?filter[bundleId]=${encodeURIComponent(bundleId)}`,
    {headers},
  );
  const appId = apps.data?.[0]?.id;
  if (!appId) {
    console.log(`App Store Connect: no app found for ${bundleId}`);
    return {versionName: null, buildNumber: 0};
  }

  const [versions, builds, preRelease] = await Promise.all([
    httpsJson(
      `https://api.appstoreconnect.apple.com/v1/apps/${appId}/appStoreVersions?limit=5&sort=-version`,
      {headers},
    ),
    httpsJson(
      `https://api.appstoreconnect.apple.com/v1/builds?filter[app]=${appId}&limit=50&sort=-uploadedDate`,
      {headers},
    ),
    httpsJson(
      `https://api.appstoreconnect.apple.com/v1/preReleaseVersions?filter[app]=${appId}&limit=50&sort=-version`,
      {headers},
    ),
  ]);

  let versionName = null;
  for (const version of [...(versions.data || []), ...(preRelease.data || [])]) {
    const value = version.attributes?.version;
    if (parseSemver(value)) {
      versionName = maxSemver(versionName, value) || versionName;
    }
  }

  let buildNumber = 0;
  for (const build of builds.data || []) {
    const value = Number(build.attributes?.version);
    if (Number.isFinite(value) && value > buildNumber) {
      buildNumber = value;
    }
  }

  console.log(
    `App Store Connect latest: versionName=${versionName || 'none'} build=${buildNumber || 'none'}`,
  );
  return {versionName, buildNumber};
}

async function resolveAndroid() {
  const baseVersion = resolveBaseVersion();
  const packageName = process.env.ANDROID_PACKAGE_NAME || 'com.nsnr.alphavlogs';
  const runNumber = Number(process.env.GITHUB_RUN_NUMBER || '0');
  const runAttempt = Number(process.env.GITHUB_RUN_ATTEMPT || '1');

  let store = {versionName: null, versionCode: 0};
  try {
    store = await queryPlayStore(packageName);
  } catch (error) {
    console.log(`Play Store query failed; using local fallback. ${error.message}`);
  }

  const versionName = nextMarketingVersion(baseVersion, store.versionName);
  const computedCode = semverToVersionCode(versionName);
  let versionCode = Math.max(computedCode, (store.versionCode || 0) + 1);
  if (!store.versionCode) {
    versionCode = Math.max(versionCode, 1000000 + runNumber * 10 + runAttempt);
  }

  writeOutput({
    version_name: versionName,
    version_code: String(versionCode),
    bumped: String(versionName !== baseVersion || versionCode !== computedCode),
    store_version_name: store.versionName || '',
    store_version_code: String(store.versionCode || 0),
  });
  console.log(`Version name: ${versionName}`);
  console.log(`Version code: ${versionCode}`);
}

async function resolveIos() {
  const baseVersion = resolveBaseVersion();
  const bundleId = process.env.IOS_BUNDLE_ID || 'com.nsnr.alphavlogsindia';
  const runNumber = Number(process.env.GITHUB_RUN_NUMBER || '0');
  const runAttempt = Number(process.env.GITHUB_RUN_ATTEMPT || '1');

  let store = {versionName: null, buildNumber: 0};
  try {
    store = await queryAppStoreConnect(bundleId);
  } catch (error) {
    console.log(`App Store Connect query failed; using local fallback. ${error.message}`);
  }

  const versionName = nextMarketingVersion(baseVersion, store.versionName);
  let buildNumber = Math.max(runNumber, (store.buildNumber || 0) + 1);
  if (!store.buildNumber) {
    buildNumber = Math.max(buildNumber, runNumber * 10 + runAttempt);
  }

  writeOutput({
    version_name: versionName,
    build_number: String(buildNumber),
    bumped: String(versionName !== baseVersion || buildNumber !== runNumber),
    store_version_name: store.versionName || '',
    store_build_number: String(store.buildNumber || 0),
  });
  console.log(`Marketing version: ${versionName}`);
  console.log(`Build number: ${buildNumber}`);
}

function selfTest() {
  const checks = [
    [compareSemver('1.0.3', '1.0.3') === 0, 'equal semver'],
    [compareSemver('1.0.4', '1.0.3') > 0, 'greater semver'],
    [bumpPatch('1.0.3') === '1.0.4', 'bump patch'],
    [semverToVersionCode('1.0.3') === 1000003, 'version code'],
    [nextMarketingVersion('1.0.3', '1.0.3') === '1.0.4', 'auto bump when store matches'],
    [nextMarketingVersion('1.0.4', '1.0.3') === '1.0.4', 'keep higher local version'],
  ];
  const failed = checks.filter(([ok]) => !ok);
  if (failed.length) {
    fail(`self-test failed: ${failed.map(([, name]) => name).join(', ')}`);
  }
  console.log('self-test ok');
}

async function main() {
  const command = process.argv[2];
  if (command === '--self-test') {
    selfTest();
    return;
  }
  if (command === 'android') {
    await resolveAndroid();
    return;
  }
  if (command === 'ios') {
    await resolveIos();
    return;
  }
  fail('Usage: node .github/scripts/resolve-store-version.js <android|ios|--self-test>');
}

if (require.main === module) {
  main().catch(error => fail(error.stack || error.message));
}

module.exports = {
  bumpPatch,
  compareSemver,
  nextMarketingVersion,
  parseSemver,
  semverToVersionCode,
};
