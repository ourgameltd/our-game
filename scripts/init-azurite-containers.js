#!/usr/bin/env node
// Creates required blob containers in local Azurite and sets them to public blob access.
// Run once after: docker compose -f docker-compose.local.yml up -d
const crypto = require('crypto');
const http = require('http');

const ACCOUNT_NAME = 'devstoreaccount1';
const ACCOUNT_KEY = 'Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==';
const BLOB_HOST = `${ACCOUNT_NAME}.localhost`;
const API_VERSION = '2021-10-04';
const CONTAINERS = ['player-photos', 'club-logos', 'coach-photos', 'user-photos'];

function sign(method, canonicalizedHeaders, canonicalizedResource) {
  const stringToSign =
    `${method}\n` +
    '\n' + // Content-Encoding
    '\n' + // Content-Language
    '\n' + // Content-Length
    '\n' + // Content-MD5
    '\n' + // Content-Type
    '\n' + // Date
    '\n' + // If-Modified-Since
    '\n' + // If-Match
    '\n' + // If-None-Match
    '\n' + // If-Unmodified-Since
    '\n' + // Range
    canonicalizedHeaders +
    canonicalizedResource;

  const key = Buffer.from(ACCOUNT_KEY, 'base64');
  return crypto.createHmac('sha256', key).update(stringToSign, 'utf8').digest('base64');
}

function request({ method, path, headers }) {
  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: BLOB_HOST,
        port: 10000,
        method,
        path,
        headers,
      },
      (res) => {
        let body = '';
        res.on('data', (chunk) => {
          body += chunk;
        });
        res.on('end', () => {
          resolve({ statusCode: res.statusCode ?? 0, body });
        });
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function createContainer(name) {
  const date = new Date().toUTCString();
  const canonicalizedHeaders = `x-ms-date:${date}\nx-ms-version:${API_VERSION}\n`;
  const canonicalizedResource = `/${ACCOUNT_NAME}/${name}\nrestype:container`;
  const signature = sign('PUT', canonicalizedHeaders, canonicalizedResource);

  const res = await request({
    method: 'PUT',
    path: `/${name}?restype=container`,
    headers: {
      'x-ms-date': date,
      'x-ms-version': API_VERSION,
      Authorization: `SharedKey ${ACCOUNT_NAME}:${signature}`,
      'Content-Length': '0',
    },
  });

  if (res.statusCode === 201) {
    console.log(`Created:        ${name}`);
    return;
  }

  if (res.statusCode === 409) {
    console.log(`Already exists: ${name}`);
    return;
  }

  throw new Error(`HTTP ${res.statusCode} creating '${name}': ${res.body}`);
}

async function setContainerPublicBlobAccess(name) {
  const date = new Date().toUTCString();
  const canonicalizedHeaders =
    'x-ms-blob-public-access:blob\n' +
    `x-ms-date:${date}\n` +
    `x-ms-version:${API_VERSION}\n`;
  const canonicalizedResource = `/${ACCOUNT_NAME}/${name}\ncomp:acl\nrestype:container`;
  const signature = sign('PUT', canonicalizedHeaders, canonicalizedResource);

  const res = await request({
    method: 'PUT',
    path: `/${name}?restype=container&comp=acl`,
    headers: {
      'x-ms-blob-public-access': 'blob',
      'x-ms-date': date,
      'x-ms-version': API_VERSION,
      Authorization: `SharedKey ${ACCOUNT_NAME}:${signature}`,
      'Content-Length': '0',
    },
  });

  if (res.statusCode === 200) {
    console.log(`Public access:  ${name}`);
    return;
  }

  throw new Error(`HTTP ${res.statusCode} setting ACL for '${name}': ${res.body}`);
}

(async () => {
  for (const name of CONTAINERS) {
    await createContainer(name);
    await setContainerPublicBlobAccess(name);
  }
  console.log('Done.');
})().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
