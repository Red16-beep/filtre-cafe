/**
 * filtré. — Cloudflare Worker
 * Proxy sécurisé entre le site et :
 *   • L'API Airtable (catalogue de cafés)
 *   • L'API Brevo  (inscription newsletter)
 *
 * + Cron quotidien : vérifie les URLs → marque Inactive si 404
 *
 * ── Déploiement ─────────────────────────────────────────────────────────────
 * 1. dash.cloudflare.com → Workers & Pages → Create Worker
 * 2. Coller ce code → Deploy
 * 3. Settings → Variables → Add (Secret) :
 *
 *      AIRTABLE_TOKEN  ← airtable.com/create/tokens
 *      AIRTABLE_BASE   ← ID de ta base  (ex: app7QoSQdT5sYoQ8F)
 *      AIRTABLE_TABLE  ← ID de la table (ex: tblg9QAw3WRD4UZ1v)
 *
 *      BREVO_API_KEY   ← compte.brevo.com → API Keys
 *      BREVO_LIST_ID   ← numéro de ta liste contacts (ex: 2)
 *
 * 4. Settings → Triggers → Cron : ajouter "0 3 * * *"  (3h UTC chaque nuit)
 * 5. Copier l'URL du worker → remplacer REMPLACER_PAR_URL_WORKER dans index.html
 *
 * ── Routes ──────────────────────────────────────────────────────────────────
 * GET  /            → catalogue Airtable (json, Active uniquement)
 * POST /newsletter  → inscription Brevo  (json)
 * GET  /check-urls  → déclenche manuellement la vérification des URLs
 *
 * ── Cron ────────────────────────────────────────────────────────────────────
 * Chaque nuit à 3h UTC :
 *   1. Récupère tous les records Active
 *   2. HEAD request sur chaque URL
 *   3. Si 404 → passe le record en Inactive automatiquement
 */

const ALLOWED_ORIGINS = [
  'https://filtre.cafe',
  'http://localhost:8080',
  'http://localhost:3000',
];

function corsHeaders(origin) {
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age':       '86400',
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  Vérification des URLs — utilisé par le cron ET par GET /check-urls
// ══════════════════════════════════════════════════════════════════════════════
async function checkUrls(env) {
  const base  = env.AIRTABLE_BASE;
  const table = env.AIRTABLE_TABLE;
  const token = env.AIRTABLE_TOKEN;

  // 1. Récupère tous les records Active avec leur URL
  const params = new URLSearchParams({
    'filterByFormula': "Status='Active'",
    'fields[]':        'Nom',
  });
  params.append('fields[]', 'URL');

  const res = await fetch(
    `https://api.airtable.com/v0/${base}/${table}?${params}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  if (!res.ok) throw new Error(`Airtable fetch failed: ${res.status}`);
  const { records } = await res.json();

  const dead    = [];  // records à désactiver
  const results = [];

  // 2. Vérifie chaque URL (HEAD → fallback GET si 405)
  for (const record of records) {
    const url = record.fields.URL;
    const nom = record.fields.Nom;

    if (!url) {
      results.push({ nom, url: null, status: 'no_url', action: 'skip' });
      continue;
    }

    try {
      let status;

      // HEAD d'abord (léger)
      const headRes = await fetch(url, {
        method:  'HEAD',
        redirect: 'follow',
        headers: { 'User-Agent': 'filtré-bot/1.0 (url-checker)' },
        signal:  AbortSignal.timeout(8000),
      });
      status = headRes.status;

      // Certains serveurs refusent HEAD → on essaie GET avec Range
      if (status === 405 || status === 501) {
        const getRes = await fetch(url, {
          method:  'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'filtré-bot/1.0 (url-checker)',
            'Range':      'bytes=0-0',
          },
          signal: AbortSignal.timeout(8000),
        });
        status = getRes.status === 206 ? 200 : getRes.status;
      }

      // Seulement 404 = page produit supprimée → Inactive
      // 5xx = problème serveur temporaire → on ne touche pas
      if (status === 404) {
        dead.push({ id: record.id, nom, url, status });
        results.push({ nom, url, status, action: 'deactivated' });
      } else {
        results.push({ nom, url, status, action: 'ok' });
      }

    } catch (err) {
      // Timeout ou réseau → on ignore, pas de déactivation
      results.push({ nom, url, status: 'error', error: err.message, action: 'skip' });
    }
  }

  // 3. Marque les 404 en Inactive (batch de 10)
  for (let i = 0; i < dead.length; i += 10) {
    const batch = dead.slice(i, i + 10);
    await fetch(`https://api.airtable.com/v0/${base}/${table}`, {
      method:  'PATCH',
      headers: {
        Authorization:  `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        records: batch.map(r => ({
          id:     r.id,
          fields: { Status: 'Inactive' },
        })),
      }),
    });
  }

  return {
    checked:     records.length,
    deactivated: dead.length,
    dead:        dead.map(r => ({ nom: r.nom, url: r.url })),
    results,
    checkedAt:   new Date().toISOString(),
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  Handler principal (HTTP)
// ══════════════════════════════════════════════════════════════════════════════
export default {

  async fetch(request, env) {
    const origin = request.headers.get('Origin') || '';
    const cors   = corsHeaders(origin);
    const url    = new URL(request.url);

    // Preflight CORS
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }

    // ── POST /newsletter ──────────────────────────────────────────────────
    if (url.pathname === '/newsletter' && request.method === 'POST') {
      try {
        const body  = await request.json();
        const email = (body.email || '').trim().toLowerCase();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return new Response(JSON.stringify({ error: 'Email invalide' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
          method:  'POST',
          headers: {
            Accept:         'application/json',
            'Content-Type': 'application/json',
            'api-key':      env.BREVO_API_KEY,
          },
          body: JSON.stringify({
            email,
            listIds:       [parseInt(env.BREVO_LIST_ID, 10)],
            updateEnabled: true,
            attributes:    { SOURCE: 'filtre.cafe' },
          }),
        });

        if (brevoRes.status === 201 || brevoRes.status === 204) {
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        if (brevoRes.status === 400) {
          const data = await brevoRes.json().catch(() => ({}));
          if (data.code === 'duplicate_parameter') {
            return new Response(JSON.stringify({ success: true, existing: true }), {
              status: 200,
              headers: { ...cors, 'Content-Type': 'application/json' },
            });
          }
          return new Response(JSON.stringify({ error: data.message || 'Erreur Brevo' }), {
            status: 400,
            headers: { ...cors, 'Content-Type': 'application/json' },
          });
        }

        return new Response(JSON.stringify({ error: 'Erreur Brevo', status: brevoRes.status }), {
          status: 502,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });

      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── GET /check-urls — déclenchement manuel ────────────────────────────
    if (url.pathname === '/check-urls' && request.method === 'GET') {
      try {
        const report = await checkUrls(env);
        return new Response(JSON.stringify(report, null, 2), {
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      } catch (err) {
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { ...cors, 'Content-Type': 'application/json' },
        });
      }
    }

    // ── GET / — Catalogue Airtable ────────────────────────────────────────
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: cors });
    }

    try {
      const fields = [
        'Nom','Marque','URL','Prix','Poids','Type','Intensite',
        'Acidite','Corps','Sucre','Aromes','Methodes','Note',
        'SCA','Verdict','Icone',
      ];
      const params = new URLSearchParams({
        'filterByFormula':    "Status='Active'",
        'sort[0][field]':     'Note',
        'sort[0][direction]': 'desc',
      });
      fields.forEach(f => params.append('fields[]', f));

      const airtableRes = await fetch(
        `https://api.airtable.com/v0/${env.AIRTABLE_BASE}/${env.AIRTABLE_TABLE}?${params}`,
        {
          headers: { Authorization: `Bearer ${env.AIRTABLE_TOKEN}` },
          cf:      { cacheTtl: 300, cacheEverything: true },
        }
      );

      if (!airtableRes.ok) {
        return new Response(
          JSON.stringify({ error: 'Airtable error', status: airtableRes.status }),
          { status: 502, headers: { ...cors, 'Content-Type': 'application/json' } }
        );
      }

      const data = await airtableRes.json();
      return new Response(JSON.stringify(data), {
        headers: {
          ...cors,
          'Content-Type':  'application/json',
          'Cache-Control': 'public, max-age=300',
        },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  //  Handler cron — déclenché chaque nuit à 3h UTC
  //  Config dans Cloudflare : Settings → Triggers → Cron → "0 3 * * *"
  // ══════════════════════════════════════════════════════════════════════════
  async scheduled(event, env, ctx) {
    ctx.waitUntil(
      checkUrls(env).then(report => {
        console.log(
          `[filtré cron] ${report.checkedAt} — ` +
          `${report.checked} URLs vérifiées, ` +
          `${report.deactivated} désactivées`
        );
        if (report.dead.length > 0) {
          console.log('[filtré cron] URLs mortes :', JSON.stringify(report.dead));
        }
      })
    );
  },
};
