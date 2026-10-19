#!/usr/bin/env node
// Search Console : etat d'indexation des pages (API URL Inspection), et renvoi du sitemap.
//
// Usage :
//   node scripts/gsc.mjs                      # les pages du dernier lastmod de sitemap.xml
//   node scripts/gsc.mjs https://filtre.cafe/journal/x  https://...   # URLs precises
//   node scripts/gsc.mjs --sitemap            # renvoie sitemap.xml a Google (autorisation "Complete")
//
// Acces : un compte de service Google, ajoute comme utilisateur de la propriete filtre.cafe dans la
// Search Console (Parametres > Utilisateurs et autorisations ; "Restreinte" suffit pour inspecter).
// Sa cle se lit dans l'environnement, jamais dans le depot :
//   GSC_CLIENT_EMAIL et GSC_PRIVATE_KEY (champs client_email et private_key du fichier JSON, tels quels)
//   ou GSC_SERVICE_ACCOUNT_JSON (le fichier entier, sur une ligne ou en base64).
// En session cloud, le proxy demande NODE_USE_ENV_PROXY=1 devant la commande.
//
// L'API ne sait pas "Demander l'indexation" : ca reste un clic dans la Search Console.

import { readFileSync } from 'node:fs';
import { createSign } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const SITEMAP = 'https://filtre.cafe/sitemap.xml';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const API = 'https://www.googleapis.com/webmasters/v3';
const INSPECT = 'https://searchconsole.googleapis.com/v1/urlInspection/index:inspect';

const __dirname = dirname(fileURLToPath(import.meta.url));

function compte() {
  let json = process.env.GSC_SERVICE_ACCOUNT_JSON;
  if (json) {
    if (!json.trim().startsWith('{')) json = Buffer.from(json, 'base64').toString('utf8');
    const c = JSON.parse(json);
    return { email: c.client_email, cle: c.private_key };
  }
  const email = process.env.GSC_CLIENT_EMAIL, cle = process.env.GSC_PRIVATE_KEY;
  if (!email || !cle) {
    console.error('Cle absente : definir GSC_CLIENT_EMAIL et GSC_PRIVATE_KEY (ou GSC_SERVICE_ACCOUNT_JSON).');
    process.exit(1);
  }
  // Collee depuis le JSON, la cle garde ses "\n" ecrits en toutes lettres.
  return { email, cle: cle.replace(/^"|"$/g, '').replace(/\\n/g, '\n') };
}

async function jeton({ email, cle }, scope) {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const maintenant = Math.floor(Date.now() / 1000);
  const corps = b64({ alg: 'RS256', typ: 'JWT' }) + '.' +
    b64({ iss: email, scope, aud: TOKEN_URL, iat: maintenant, exp: maintenant + 3600 });
  const signature = createSign('RSA-SHA256').update(corps).sign(cle, 'base64url');
  const res = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: corps + '.' + signature })
  });
  const r = await res.json().catch(() => ({}));
  if (!res.ok || !r.access_token) {
    console.error(`Google refuse la cle (HTTP ${res.status}) : ${r.error_description || r.error || 'reponse illisible'}`);
    process.exit(1);
  }
  return r.access_token;
}

async function appel(url, jet, options = {}) {
  const res = await fetch(url, { ...options, headers: { Authorization: `Bearer ${jet}`, 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const texte = await res.text();
  const r = texte ? JSON.parse(texte) : {};
  if (!res.ok) throw new Error(`HTTP ${res.status} : ${(r.error && r.error.message) || texte}`);
  return r;
}

// La propriete filtre.cafe a laquelle le compte de service a acces (domaine ou prefixe d'URL).
async function propriete(jet, email) {
  const { siteEntry = [] } = await appel(`${API}/sites`, jet);
  const site = siteEntry.find((s) => s.siteUrl === 'sc-domain:filtre.cafe') ||
    siteEntry.find((s) => /^https:\/\/(www\.)?filtre\.cafe\/$/.test(s.siteUrl));
  if (!site) {
    console.error(`Aucune propriete filtre.cafe pour ${email} : l'ajouter dans la Search Console, ` +
      'Parametres > Utilisateurs et autorisations.');
    process.exit(1);
  }
  return site;
}

function dernieresPages() {
  const xml = readFileSync(resolve(__dirname, '..', 'sitemap.xml'), 'utf8');
  const pages = [...xml.matchAll(/<url>[\s\S]*?<\/url>/g)].map((m) => ({
    loc: (m[0].match(/<loc>([^<]+)<\/loc>/) || [])[1],
    lastmod: (m[0].match(/<lastmod>([^<]+)<\/lastmod>/) || [])[1] || ''
  })).filter((p) => p.loc);
  const derniere = pages.reduce((max, p) => (p.lastmod > max ? p.lastmod : max), '');
  return pages.filter((p) => p.lastmod === derniere).map((p) => p.loc.trim());
}

function quand(iso) {
  if (!iso) return 'jamais';
  return new Date(iso).toLocaleString('fr-FR', { dateStyle: 'long', timeStyle: 'short', timeZone: 'Europe/Paris' });
}

async function inspecter(urls) {
  const c = compte();
  const jet = await jeton(c, 'https://www.googleapis.com/auth/webmasters.readonly');
  const site = await propriete(jet, c.email);
  console.log(`Propriete ${site.siteUrl} (${site.permissionLevel}), ${urls.length} page(s)\n`);
  let ko = 0;
  for (const url of urls) {
    try {
      const { inspectionResult: r = {} } = await appel(INSPECT, jet, {
        method: 'POST', body: JSON.stringify({ inspectionUrl: url, siteUrl: site.siteUrl, languageCode: 'fr-FR' })
      });
      const s = r.indexStatusResult || {};
      console.log(`${s.verdict || '?'}  ${url}`);
      console.log(`      ${s.coverageState || 'etat inconnu'} ; dernier passage : ${quand(s.lastCrawlTime)}`);
      if (s.indexingState && s.indexingState !== 'INDEXING_ALLOWED') console.log(`      indexation : ${s.indexingState}`);
      if (s.robotsTxtState && s.robotsTxtState !== 'ALLOWED') console.log(`      robots.txt : ${s.robotsTxtState}`);
      if (s.pageFetchState && s.pageFetchState !== 'SUCCESSFUL') console.log(`      lecture de la page : ${s.pageFetchState}`);
      if (s.googleCanonical && s.googleCanonical !== url) console.log(`      canonique retenue par Google : ${s.googleCanonical}`);
    } catch (e) {
      ko++;
      console.log(`ERREUR  ${url}\n      ${e.message}`);
    }
  }
  if (ko) process.exit(1);
}

async function renvoyerSitemap() {
  const c = compte();
  const jet = await jeton(c, 'https://www.googleapis.com/auth/webmasters');
  const site = await propriete(jet, c.email);
  await appel(`${API}/sites/${encodeURIComponent(site.siteUrl)}/sitemaps/${encodeURIComponent(SITEMAP)}`, jet, { method: 'PUT' });
  console.log(`OK : ${SITEMAP} renvoye a la propriete ${site.siteUrl}.`);
}

const args = process.argv.slice(2).filter(Boolean);
(args.includes('--sitemap') ? renvoyerSitemap() : inspecter(args.length ? args : dernieresPages())).catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
