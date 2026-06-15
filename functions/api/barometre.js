// Baromètre du café de spécialité — réception des réponses du sondage.
// Même origine que le site (pas de CORS), déployé avec les Pages Functions.
// Env requis (Cloudflare Pages → Settings → Variables) :
//   AIRTABLE_TOKEN, AIRTABLE_BASE, AIRTABLE_BAROMETRE_TABLE
export async function onRequestPost(context) {
  const { request, env } = context;
  const token = env.AIRTABLE_TOKEN;
  const base = env.AIRTABLE_BASE;
  const table = env.AIRTABLE_BAROMETRE_TABLE;

  if (!token || !base || !table) {
    return json({ error: 'Configuration Airtable manquante' }, 500);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Body invalide' }, 400);
  }

  // Anti-bot : champ piège (honeypot). Rempli = bot → on fait semblant d'accepter.
  if (body.website) return json({ success: true });

  const str = (v, max = 150) =>
    (Array.isArray(v) ? v.join(', ') : v == null ? '' : String(v)).trim().slice(0, max);

  const fields = {
    Methode: str(body.methode),
    Budget: str(body.budget),
    PrixMax: str(body.prix_max),
    Mouture: str(body.mouture),
    Materiel: str(body.materiel, 400),
    Canaux: str(body.canaux, 400),
    Abonnement: str(body.abonnement),
    Frein: str(body.frein),
    Declencheur: str(body.declencheur),
    Anciennete: str(body.anciennete),
    Age: str(body.age),
    Region: str(body.region, 80),
    Source: 'filtre.cafe',
  };

  // Réponse vide / sans la question principale → on refuse.
  if (!fields.Methode) return json({ error: 'Réponse vide' }, 400);

  try {
    const res = await fetch(`https://api.airtable.com/v0/${base}/${encodeURIComponent(table)}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields, typecast: true }),
    });

    if (res.ok) return json({ success: true });

    const data = await res.json().catch(() => ({}));
    return json({ error: data?.error?.message || 'Erreur Airtable', status: res.status }, 502);
  } catch (err) {
    return json({ error: 'Erreur serveur' }, 500);
  }
}

function json(obj, status = 200) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}
