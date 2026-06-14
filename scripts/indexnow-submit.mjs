#!/usr/bin/env node
// Soumission IndexNow : lit sitemap.xml et pousse toutes les URLs a Bing/IndexNow.
//
// Usage :
//   node scripts/indexnow-submit.mjs                 # toutes les URLs du sitemap
//   node scripts/indexnow-submit.mjs https://filtre.cafe/journal/x  https://...  # URLs precises
//
// Necessite un acces reseau sortant vers api.indexnow.org (lancer en local ou en CI,
// pas depuis un sandbox a egress restreint).

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const HOST = 'filtre.cafe';
const KEY = '952ae93894774a3b947188d5ef63b203';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const __dirname = dirname(fileURLToPath(import.meta.url));

function urlsFromSitemap() {
  const xml = readFileSync(resolve(__dirname, '..', 'sitemap.xml'), 'utf8');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}

async function main() {
  const cliUrls = process.argv.slice(2).filter(Boolean);
  const urlList = cliUrls.length ? cliUrls : urlsFromSitemap();

  if (!urlList.length) {
    console.error('Aucune URL a soumettre.');
    process.exit(1);
  }

  console.log(`Soumission de ${urlList.length} URL(s) a IndexNow…`);

  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: HOST, key: KEY, keyLocation: KEY_LOCATION, urlList })
  });

  const body = await res.text();
  console.log(`HTTP ${res.status} ${res.statusText}`);
  if (body) console.log(body);

  // 200 = traite, 202 = accepte (en file). Tout le reste = probleme.
  if (res.status !== 200 && res.status !== 202) {
    console.error('Echec de la soumission IndexNow.');
    process.exit(1);
  }
  console.log('OK — URLs soumises.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
