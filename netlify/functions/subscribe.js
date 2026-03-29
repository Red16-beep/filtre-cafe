exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const BREVO_API_KEY = process.env.BREVO_API_KEY;
  const LIST_ID = 2;

  if (!BREVO_API_KEY) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key manquante' }) };
  }

  let email;
  try {
    const body = JSON.parse(event.body);
    email = body.email?.trim().toLowerCase();
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Body invalide' }) };
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Email invalide' }) };
  }

  try {
    const res = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        listIds: [LIST_ID],
        updateEnabled: true
      })
    });

    // 201 = créé, 204 = déjà existant mis à jour
    if (res.status === 201 || res.status === 204) {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true })
      };
    }

    const data = await res.json();
    // Contact déjà dans la liste = pas une erreur
    if (data.code === 'duplicate_parameter') {
      return {
        statusCode: 200,
        headers: { 'Access-Control-Allow-Origin': '*' },
        body: JSON.stringify({ success: true })
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ error: data.message || 'Erreur Brevo' })
    };

  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Erreur serveur' })
    };
  }
};
