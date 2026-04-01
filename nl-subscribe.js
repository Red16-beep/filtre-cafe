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
      body: JSON.stringify({ email })
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
