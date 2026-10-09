// Inscription à la lettre. Toute la protection vit ici, jamais dans la page :
// voir CLAUDE.md. Le champ _ts du formulaire filtre les bots les plus simples,
// il ne vaut rien contre quelqu'un qui vise l'endpoint directement.

const LIST_ID = 2;
const SITE = 'https://filtre.cafe';
const ALLOWED_ORIGINS = new Set(['https://filtre.cafe', 'https://www.filtre.cafe']);

// Au-delà de la limite, on répond "success" sans rien envoyer à Brevo.
// Cinq par heure : assez large pour plusieurs personnes derrière une même
// connexion (bureau, mobile), assez étroit pour qu'une boucle ne remplisse pas
// la liste. Fenêtre par tranche horaire : on ne cherche pas la précision.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 3600; // secondes

const MAX_BODY_BYTES = 2048;
const MAX_EMAIL_LENGTH = 254;

const JSON_HEADERS = {
  'Content-Type': 'application/json',
  'Cache-Control': 'no-store',
  'X-Content-Type-Options': 'nosniff'
};

function reply(payload, status) {
  return new Response(JSON.stringify(payload), { status, headers: JSON_HEADERS });
}

// Réponse volontairement identique à un succès : un bot ne doit pas apprendre
// qu'il a été bloqué, sinon il ajuste et recommence.
function silentOk() {
  return reply({ success: true }, 200);
}

// Compteur par IP. Utilise le KV s'il est bindé (compte partagé entre
// datacenters), sinon le cache local, qui ne compte que par datacenter mais
// coûte zéro configuration.
async function hitRateLimit(env, ip) {
  const key = `rl:${ip}`;

  if (env.NL_RATELIMIT) {
    const current = parseInt(await env.NL_RATELIMIT.get(key), 10) || 0;
    if (current >= RATE_LIMIT_MAX) return true;
    await env.NL_RATELIMIT.put(key, String(current + 1), { expirationTtl: RATE_LIMIT_WINDOW });
    return false;
  }

  const cache = caches.default;
  const cacheKey = new Request(`https://ratelimit.filtre.cafe/${encodeURIComponent(ip)}`);
  const hit = await cache.match(cacheKey);
  const current = hit ? parseInt(await hit.text(), 10) || 0 : 0;
  if (current >= RATE_LIMIT_MAX) return true;
  await cache.put(cacheKey, new Response(String(current + 1), {
    headers: { 'Cache-Control': `max-age=${RATE_LIMIT_WINDOW}` }
  }));
  return false;
}

// Un navigateur envoie toujours Origin sur un POST. Sans Origin, on accepte
// seulement une requête que le navigateur déclare same-origin.
function originAllowed(request) {
  const origin = request.headers.get('Origin');
  if (origin) return ALLOWED_ORIGINS.has(origin);
  return request.headers.get('Sec-Fetch-Site') === 'same-origin';
}

// Double opt-in si le modèle de confirmation Brevo est configuré
// (variable BREVO_DOI_TEMPLATE_ID) : l'adresse n'entre dans la liste qu'après
// un clic dans le mail. Sinon, ajout direct, comme avant.
async function subscribe(env, email) {
  const headers = {
    'accept': 'application/json',
    'content-type': 'application/json',
    'api-key': env.BREVO_API_KEY
  };
  const templateId = parseInt(env.BREVO_DOI_TEMPLATE_ID, 10);

  if (templateId) {
    return fetch('https://api.brevo.com/v3/contacts/doubleOptinConfirmation', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        email,
        includeListIds: [LIST_ID],
        templateId,
        redirectionUrl: `${SITE}/newsletter`
      })
    });
  }

  // updateEnabled à false : une adresse déjà désinscrite n'est pas réactivée.
  return fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers,
    body: JSON.stringify({ email, listIds: [LIST_ID], updateEnabled: false })
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  if (!originAllowed(request)) {
    return reply({ error: 'Requete refusee' }, 403);
  }

  if (!(request.headers.get('content-type') || '').toLowerCase().includes('application/json')) {
    return reply({ error: 'Requete invalide' }, 415);
  }

  if (Number(request.headers.get('content-length')) > MAX_BODY_BYTES) {
    return reply({ error: 'Requete invalide' }, 413);
  }

  if (!env.BREVO_API_KEY) {
    console.error('subscribe: BREVO_API_KEY manquante');
    return reply({ error: 'Erreur serveur' }, 500);
  }

  let body;
  try {
    const text = await request.text();
    if (text.length > MAX_BODY_BYTES) return reply({ error: 'Requete invalide' }, 413);
    body = JSON.parse(text);
  } catch {
    return reply({ error: 'Requete invalide' }, 400);
  }
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return reply({ error: 'Requete invalide' }, 400);
  }

  // Anti-bot : le formulaire envoie le temps écoulé depuis le chargement.
  // Sans ce jeton, la requête est refusée (400) : un formulaire qui l'oublie
  // doit échouer visiblement. Une soumission instantanée ne vient pas d'un
  // humain : faux succès, sans appel à Brevo.
  const elapsed = body._ts;
  if (typeof elapsed !== 'number' || !Number.isFinite(elapsed)) {
    return reply({ error: 'Requete invalide' }, 400);
  }
  if (elapsed < 1200) return silentOk();

  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email || email.length > MAX_EMAIL_LENGTH || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply({ error: 'Email invalide' }, 400);
  }

  // Seul garde-fou que l'inspecteur du navigateur ne permet pas de contourner.
  const ip = request.headers.get('CF-Connecting-IP');
  if (!ip) return reply({ error: 'Requete invalide' }, 400);
  try {
    if (await hitRateLimit(env, ip)) return silentOk();
  } catch {
    // Un incident de stockage ne doit pas bloquer une inscription légitime.
  }

  try {
    const res = await subscribe(env, email);

    // 201 / 204 : contact créé ou confirmation envoyée.
    if (res.status === 201 || res.status === 204) return silentOk();

    const data = await res.json().catch(() => ({}));
    // Adresse déjà connue : même réponse qu'un succès, pas d'énumération.
    if (data.code === 'duplicate_parameter') return silentOk();

    // Le message de Brevo n'est jamais renvoyé au visiteur.
    console.error('subscribe: Brevo', res.status, data.code || '');
    return reply({ error: 'Inscription impossible' }, 400);
  } catch {
    return reply({ error: 'Erreur serveur' }, 500);
  }
}
