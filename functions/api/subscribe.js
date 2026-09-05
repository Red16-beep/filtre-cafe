// Limite d'inscription : au-dela, on repond "success" sans rien envoyer a Brevo.
// La fenetre est glissante par tranche horaire, ce qui suffit ici : on ne cherche
// pas la precision, on cherche a ce qu'une boucle ne remplisse pas la liste.
const RATE_LIMIT_MAX = 3;
const RATE_LIMIT_WINDOW = 3600; // secondes

// Compteur par IP. Utilise le KV s'il est bindé (compte partage entre datacenters),
// sinon le cache local, qui ne compte que par datacenter mais coute zero config.
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

// Reponse volontairement identique a un succes : un bot ne doit pas apprendre
// qu'il a ete bloque, sinon il ajuste et recommence.
function silentOk() {
  return new Response(JSON.stringify({ success: true }), {
    status: 200, headers: { 'Content-Type': 'application/json' }
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;

  const BREVO_API_KEY = env.BREVO_API_KEY;
  const LIST_ID = 2;

  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key manquante' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  let email, body;
  try {
    body = await request.json();
    email = body.email?.trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: 'Body invalide' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // anti-bot : le formulaire envoie le temps ecoule depuis le chargement.
  // Une soumission instantanee, ou sans ce jeton, ne vient pas d'un humain.
  // Contournable en appelant l'API directement, d'ou la limite par IP ci-dessous.
  const elapsed = body._ts;
  if (typeof elapsed !== 'number' || elapsed < 1200) {
    return silentOk();
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Email invalide' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  // Seul garde-fou que l'inspecteur du navigateur ne permet pas de contourner.
  const ip = request.headers.get('CF-Connecting-IP') || 'inconnue';
  try {
    if (await hitRateLimit(env, ip)) return silentOk();
  } catch {
    // Un incident de stockage ne doit pas bloquer une inscription legitime.
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({ email, listIds: [LIST_ID], updateEnabled: true })
    });

    if (res.status === 201 || res.status === 204) {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    const data = await res.json();
    if (data.code === 'duplicate_parameter') {
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
      });
    }

    return new Response(JSON.stringify({ error: data.message || 'Erreur Brevo' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Erreur serveur' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }
}
