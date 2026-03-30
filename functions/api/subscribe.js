export async function onRequestPost(context) {
  const { request, env } = context;

  const BREVO_API_KEY = env.BREVO_API_KEY;
  const LIST_ID = 2;

  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ error: 'API key manquante' }), {
      status: 500, headers: { 'Content-Type': 'application/json' }
    });
  }

  let email;
  try {
    const body = await request.json();
    email = body.email?.trim().toLowerCase();
  } catch {
    return new Response(JSON.stringify({ error: 'Body invalide' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: 'Email invalide' }), {
      status: 400, headers: { 'Content-Type': 'application/json' }
    });
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
