// horodatage de chargement, sert a rejeter les soumissions instantanees des bots
window._pageLoadedAt = window._pageLoadedAt || Date.now();  // pose une seule fois, quel que soit l'ordre de chargement des deux scripts

async function nlSubscribe(e) {
  e.preventDefault();
  const form = e.target;
  const input = form.querySelector('input[type="email"]');
  const btn = form.querySelector('button[type="submit"]');
  const email = input.value.trim().toLowerCase();

  btn.disabled = true;
  btn.textContent = '…';

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, _ts: Date.now() - window._pageLoadedAt })
    });

    if (res.ok) {
      form.outerHTML = '<p class="text-amber-400 text-sm font-medium mt-1">Bienvenue ! On se retrouve dans votre boîte mail.</p>';
    } else {
      btn.disabled = false;
      btn.textContent = 'Réessayer →';
    }
  } catch {
    btn.disabled = false;
    btn.textContent = 'Réessayer →';
  }
}
