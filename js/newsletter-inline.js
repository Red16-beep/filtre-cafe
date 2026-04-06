// filtré. — Inline newsletter subscription
async function subscribeInline(e) {
  e.preventDefault();
  const form = e.target;
  const btn = form.querySelector('button[type="submit"]');
  const emailInput = form.querySelector('input[type="email"]');
  const ok = form.parentElement.querySelector('.nl-inline-ok');
  const err = form.parentElement.querySelector('.nl-inline-err');
  if (!emailInput || !btn) return;
  const email = emailInput.value.trim();
  btn.disabled = true;
  btn.textContent = '…';
  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, source: 'inline-' + window.location.pathname.split('/').pop().replace('.html','') })
    });
    if (!res.ok) throw new Error();
    form.style.display = 'none';
    if (ok) ok.style.display = 'block';
    if (typeof equateur === 'function') equateur('track', 'NewsletterSignup', { source: 'inline', page: window.location.pathname });
  } catch {
    if (err) { err.style.display = 'block'; err.textContent = 'Une erreur est survenue. Réessayez.'; }
    btn.disabled = false;
    btn.textContent = "S'inscrire";
  }
}
