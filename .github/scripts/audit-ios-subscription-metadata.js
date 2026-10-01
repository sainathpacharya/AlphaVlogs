#!/usr/bin/env node
'use strict';
const crypto = require('crypto');
const https = require('https');

const BUNDLE_ID = process.env.IOS_BUNDLE_ID || 'com.nsnr.alphavlogsindia';
const API = 'https://api.appstoreconnect.apple.com/v1';
const SUB_RE = /subscri|premium|iap|in-?app purchase|auto-?renew|eula|₹100|annual|paywall|storekit|billing/i;

function fail(m){ console.error(m); process.exit(1); }
function base64url(input){ const b=Buffer.isBuffer(input)?input:Buffer.from(input); return b.toString('base64').replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/g,''); }
function normalizeP8(raw){ let key=String(raw||'').trim().replace(/\\n/g,'\n'); if(!key) return ''; if(!key.includes('BEGIN')){ const body=key.replace(/\s+/g,''); key=`-----BEGIN PRIVATE KEY-----\n${body.match(/.{1,64}/g).join('\n')}\n-----END PRIVATE KEY-----`; } return key; }
function appleJwt({issuerId,keyId,privateKey}){ const now=Math.floor(Date.now()/1000); const header=base64url(JSON.stringify({alg:'ES256',kid:keyId,typ:'JWT'})); const payload=base64url(JSON.stringify({iss:issuerId,iat:now,exp:now+20*60,aud:'appstoreconnect-v1'})); const unsigned=`${header}.${payload}`; const signature=crypto.sign('sha256',Buffer.from(unsigned),{key:crypto.createPrivateKey(privateKey),dsaEncoding:'ieee-p1363'}); return `${unsigned}.${base64url(signature)}`; }
function httpsJson(url,{method='GET',headers={},body}={}){ const payload=body==null?null:typeof body==='string'?body:JSON.stringify(body); return new Promise((resolve,reject)=>{ const requestHeaders={...headers}; if(payload!=null){ requestHeaders['Content-Type']=requestHeaders['Content-Type']||'application/json'; requestHeaders['Content-Length']=Buffer.byteLength(payload);} const request=https.request(url,{method,headers:requestHeaders},response=>{ const chunks=[]; response.on('data',c=>chunks.push(c)); response.on('end',()=>{ const text=Buffer.concat(chunks).toString('utf8'); let json=null; if(text){ try{json=JSON.parse(text);}catch(e){ reject(new Error(`${method} ${url} non-JSON (${response.statusCode}): ${text.slice(0,500)}`)); return;} } if(response.statusCode<200||response.statusCode>=300){ reject(new Error(`${method} ${url} failed (${response.statusCode}): ${text.slice(0,800)}`)); return;} resolve(json);});}); request.on('error',reject); if(payload!=null) request.write(payload); request.end(); }); }

function hits(label, value){
  const text = value == null ? '' : String(value);
  if (!text.trim()) {
    console.log(`- ${label}: (empty)`);
    return false;
  }
  const matched = SUB_RE.test(text);
  console.log(`- ${label}: ${matched ? 'MENTIONS SUBSCRIPTIONS' : 'no subscription keywords'}`);
  if (matched) {
    const snippet = text.replace(/\s+/g, ' ').trim();
    console.log(`  snippet: ${snippet.slice(0, 280)}${snippet.length > 280 ? '…' : ''}`);
  }
  return matched;
}

async function main(){
  const issuerId=(process.env.APPLE_ISSUER_ID||'').trim();
  const keyId=(process.env.APPLE_KEY_ID||'').trim();
  const privateKey=normalizeP8(process.env.APPLE_PRIVATE_KEY||'');
  if(!issuerId||!keyId||!privateKey) fail('Missing Apple API credentials');
  const headers={Authorization:`Bearer ${appleJwt({issuerId,keyId,privateKey})}`};

  const apps=await httpsJson(`${API}/apps?filter[bundleId]=${encodeURIComponent(BUNDLE_ID)}&limit=1`,{headers});
  const app=apps.data?.[0]; if(!app) fail('App not found');
  console.log(`# App Store Connect subscription audit`);
  console.log(`App: ${app.attributes.name} (${app.id})`);

  let any=false;

  const versions=await httpsJson(`${API}/apps/${app.id}/appStoreVersions?filter[platform]=IOS&include=build&limit=10`,{headers});
  for (const v of versions.data||[]) {
    const state=v.attributes?.appStoreState;
    const ver=v.attributes?.versionString;
    console.log(`\n## Version ${ver} — ${state}`);
    const locs=await httpsJson(`${API}/appStoreVersions/${v.id}/appStoreVersionLocalizations?limit=20`,{headers});
    for (const loc of locs.data||[]) {
      const locale=loc.attributes?.locale;
      console.log(`Locale ${locale}:`);
      any = hits('description', loc.attributes?.description) || any;
      any = hits('keywords', loc.attributes?.keywords) || any;
      any = hits('whatsNew', loc.attributes?.whatsNew) || any;
      any = hits('promotionalText', loc.attributes?.promotionalText) || any;
      any = hits('marketingUrl', loc.attributes?.marketingUrl) || any;
      any = hits('supportUrl', loc.attributes?.supportUrl) || any;
    }
    try {
      const detail=await httpsJson(`${API}/appStoreVersions/${v.id}/appStoreReviewDetail`,{headers});
      any = hits('review notes', detail.data?.attributes?.notes) || any;
      any = hits('review demo account', detail.data?.attributes?.demoAccountName) || any;
    } catch (e) {
      console.log(`- review notes: (none)`);
    }
  }

  console.log(`\n## App info localizations`);
  const infos=await httpsJson(`${API}/apps/${app.id}/appInfos?limit=5`,{headers});
  for (const info of infos.data||[]) {
    const locs=await httpsJson(`${API}/appInfos/${info.id}/appInfoLocalizations?limit=20`,{headers});
    for (const loc of locs.data||[]) {
      console.log(`Locale ${loc.attributes?.locale}:`);
      any = hits('name', loc.attributes?.name) || any;
      any = hits('subtitle', loc.attributes?.subtitle) || any;
      any = hits('privacyPolicyUrl', loc.attributes?.privacyPolicyUrl) || any;
      any = hits('privacyChoicesUrl', loc.attributes?.privacyChoicesUrl) || any;
      any = hits('privacyPolicyText', loc.attributes?.privacyPolicyText) || any;
    }
  }

  console.log(`\n## In-App Purchases / Subscriptions`);
  try {
    const iaps=await httpsJson(`${API}/apps/${app.id}/inAppPurchasesV2?limit=50`,{headers});
    if (!(iaps.data||[]).length) console.log('- none');
    for (const iap of iaps.data||[]) {
      const name=iap.attributes?.name;
      const productId=iap.attributes?.productId;
      const state=iap.attributes?.state;
      console.log(`- IAP: ${name} / ${productId} / state=${state}`);
      any = true;
      try {
        const locs=await httpsJson(`${API}/inAppPurchases/${iap.id}/inAppPurchaseLocalizations?limit=20`,{headers});
        for (const loc of locs.data||[]) {
          any = hits(`  IAP localization ${loc.attributes?.locale} name`, loc.attributes?.name) || any;
          any = hits(`  IAP localization ${loc.attributes?.locale} description`, loc.attributes?.description) || any;
        }
      } catch (_e) {}
    }
  } catch (e) {
    console.log(`- inAppPurchasesV2 query failed: ${e.message}`);
  }

  try {
    const groups=await httpsJson(`${API}/apps/${app.id}/subscriptionGroups?limit=20`,{headers});
    if (!(groups.data||[]).length) console.log('- no subscription groups');
    for (const g of groups.data||[]) {
      console.log(`- Subscription group: ${g.attributes?.referenceName || g.id}`);
      any = true;
      const subs=await httpsJson(`${API}/subscriptionGroups/${g.id}/subscriptions?limit=50`,{headers});
      for (const s of subs.data||[]) {
        console.log(`  - ${s.attributes?.name} / ${s.attributes?.productId} / state=${s.attributes?.state} / cleared=${s.attributes?.isClearedForSale}`);
        try {
          const locs=await httpsJson(`${API}/subscriptions/${s.id}/subscriptionLocalizations?limit=20`,{headers});
          for (const loc of locs.data||[]) {
            any = hits(`    sub ${loc.attributes?.locale} name`, loc.attributes?.name) || any;
            any = hits(`    sub ${loc.attributes?.locale} description`, loc.attributes?.description) || any;
          }
        } catch (_e) {}
      }
    }
  } catch (e) {
    console.log(`- subscriptionGroups query failed: ${e.message}`);
  }

  console.log(`\n## Summary`);
  console.log(any
    ? 'Subscription-related content WAS found in App Store Connect (expected if Premium Annual still exists).'
    : 'No subscription-related App Store Connect content found.');
}
main().catch(e=>fail(e.stack||String(e)));
