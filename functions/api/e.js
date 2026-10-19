// Relais de la mesure d'audience (Equateur Analytics) : le script et la collecte passent par
// filtre.cafe, pour que les bloqueurs qui visent app.equateur.org ne coupent pas la mesure.
// GET /api/e : le script d'Equateur. POST /api/e : un envoi de ce script (page vue, temps passé,
// événement), transmis à Equateur avec l'adresse IP du visiteur et le jeton du relais, qui vit
// dans la variable d'environnement EQUATEUR_PROXY_TOKEN. Sans elle, le relais s'efface : la page
// charge le script d'Equateur directement, comme avant. Protection comme toute route de
// functions/api/ (voir CLAUDE.md) : origine filtre.cafe, corps borné, envois du seul site
// filtre.cafe, compteur par IP, échec silencieux.

const AMONT = 'https://app.equateur.org';
const SITE = 'filtre.cafe';
const ALLOWED_ORIGINS = new Set(['https://filtre.cafe', 'https://www.filtre.cafe']);
const PAGE_RE = /^https:\/\/(www\.)?filtre\.cafe\//;
const TYPES = new Set(['p', 'e', 'v']); // page vue, temps passé, événement

const MAX_BODY_BYTES = 4096;

// Un lecteur fait deux ou trois envois par page : mille par heure couvrent un bureau entier
// derrière une même adresse et arrêtent une boucle. Compteur dans le cache local seulement :
// le KV NL_RATELIMIT facture ses écritures (mille par jour en offre gratuite), une écriture par
// envoi l'épuiserait, au détriment de l'inscription à la lettre qui s'en sert aussi.
const RATE_LIMIT_MAX = 1000;
const RATE_LIMIT_WINDOW = 3600; // secondes

const JS_HEADERS = { 'Content-Type': 'text/javascript; charset=utf-8', 'X-Content-Type-Options': 'nosniff' };

// Le chargeur d'origine, quand le relais n'est pas réglé ou que le script ne se lit pas en amont.
const SCRIPT_DIRECT = `(function(){var s=document.createElement('script');s.src='${AMONT}/e.js';` +
  `s.defer=true;s.setAttribute('data-site','${SITE}');document.head.appendChild(s);})();`;

function vide(status = 204) {
  return new Response(null, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}

// Un navigateur envoie Origin sur un POST, sendBeacon compris. Sans Origin, on accepte
// seulement une requête que le navigateur déclare same-origin.
function originAllowed(request) {
  const origin = request.headers.get('Origin');
  if (origin) return ALLOWED_ORIGINS.has(origin);
  return request.headers.get('Sec-Fetch-Site') === 'same-origin';
}

// Si le cache tombe, l'envoi passe : la mesure d'un vrai lecteur compte plus qu'une boucle.
async function hitRateLimit(ip) {
  try {
    const cache = caches.default;
    const cacheKey = new Request(`https://ratelimit.filtre.cafe/e/${encodeURIComponent(ip)}`);
    const hit = await cache.match(cacheKey);
    const current = hit ? parseInt(await hit.text(), 10) || 0 : 0;
    if (current >= RATE_LIMIT_MAX) return true;
    await cache.put(cacheKey, new Response(String(current + 1), {
      headers: { 'Cache-Control': `max-age=${RATE_LIMIT_WINDOW}` }
    }));
    return false;
  } catch (e) {
    return false;
  }
}

export async function onRequestGet({ env }) {
  if (!env.EQUATEUR_PROXY_TOKEN) {
    return new Response(SCRIPT_DIRECT, { headers: { ...JS_HEADERS, 'Cache-Control': 'public, max-age=300' } });
  }
  try {
    const res = await fetch(`${AMONT}/e.js`, { cf: { cacheTtl: 3600, cacheEverything: true } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return new Response(await res.text(), { headers: { ...JS_HEADERS, 'Cache-Control': 'public, max-age=3600' } });
  } catch (e) {
    console.log('relais Equateur : script indisponible en amont,', e.message);
    return new Response(SCRIPT_DIRECT, { headers: { ...JS_HEADERS, 'Cache-Control': 'no-store' } });
  }
}

export async function onRequestPost({ request, env, waitUntil }) {
  if (!originAllowed(request)) return vide(403);

  const token = env.EQUATEUR_PROXY_TOKEN;
  if (!token) return vide();

  const declared = parseInt(request.headers.get('Content-Length'), 10);
  if (declared > MAX_BODY_BYTES) return vide(413);
  const body = await request.text();
  if (body.length > MAX_BODY_BYTES) return vide(413);

  // Seuls les envois du script, pour ce site, partent : le jeton ne couvre que filtre.cafe.
  let envoi;
  try { envoi = JSON.parse(body); } catch (e) { return vide(); }
  if (!envoi || envoi.s !== SITE || !TYPES.has(envoi.t) || typeof envoi.u !== 'string' || !PAGE_RE.test(envoi.u)) {
    return vide();
  }

  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip || await hitRateLimit(ip)) return vide();

  // Ce que le navigateur aurait envoyé lui-même à Equateur, plus son adresse et le jeton.
  const headers = {
    'Content-Type': request.headers.get('Content-Type') || 'text/plain;charset=UTF-8',
    'Origin': request.headers.get('Origin') || 'https://filtre.cafe',
    'X-Forwarded-For': ip,
    'X-Real-IP': ip,
    'X-Equateur-Proxy-Token': token
  };
  for (const nom of ['User-Agent', 'Accept-Language', 'Referer']) {
    const valeur = request.headers.get(nom);
    if (valeur) headers[nom] = valeur;
  }

  // La réponse part tout de suite : le navigateur n'attend rien d'un envoi de mesure.
  waitUntil(fetch(`${AMONT}/api/e`, { method: 'POST', headers, body })
    .then((res) => { if (!res.ok) console.log('relais Equateur : HTTP', res.status); })
    .catch((e) => console.log('relais Equateur :', e.message)));
  return vide();
}
