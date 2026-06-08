// filtré. Exit-intent popup
// Déclenché quand la souris quitte la fenêtre par le haut
// Une seule fois par session, jamais si déjà abonné

(function () {
  var STORAGE_KEY = 'filtre_nl_dismissed';

  // Ne pas afficher si déjà vu ou déjà inscrit
  if (sessionStorage.getItem(STORAGE_KEY)) return;

  var shown = false;

  function buildPopup() {
    var overlay = document.createElement('div');
    overlay.id = 'ei-overlay';
    overlay.style.cssText = [
      'position:fixed;inset:0;z-index:10000',
      'background:rgba(28,25,23,0.7)',
      'backdrop-filter:blur(6px)',
      '-webkit-backdrop-filter:blur(6px)',
      'display:flex;align-items:center;justify-content:center',
      'padding:1.25rem',
      'opacity:0;transition:opacity 0.3s ease'
    ].join(';');

    overlay.innerHTML = `
      <div id="ei-card" style="
        background:#fafaf9;
        border-radius:1.5rem;
        padding:2.5rem 2.25rem;
        max-width:440px;
        width:100%;
        position:relative;
        transform:translateY(20px);
        transition:transform 0.3s cubic-bezier(0.16,1,0.3,1);
      ">
        <button id="ei-close" aria-label="Fermer" style="
          position:absolute;top:1rem;right:1rem;
          background:none;border:none;cursor:pointer;
          color:#a8a29e;padding:0.25rem;line-height:1;font-size:1.25rem;
        ">✕</button>

        <p style="font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.3em;color:#b45309;margin-bottom:1rem;">La lettre filtré.</p>

        <p style="font-family:'Instrument Serif',serif;font-style:italic;font-size:1.6rem;line-height:1.25;color:#1c1917;margin-bottom:0.75rem;letter-spacing:-0.02em;">
          Avant de partir
        </p>
        <p style="font-size:0.9375rem;color:#78716c;font-weight:300;line-height:1.7;margin-bottom:1.75rem;">
          Torréfactions testées, guides d'extraction, origines rares. Une lettre par mois, sans remplissage.
        </p>

        <form id="ei-form" style="display:flex;flex-direction:column;gap:0.75rem;">
          <div style="display:flex;gap:0.625rem;flex-wrap:wrap;">
            <input
              id="ei-email"
              type="email"
              placeholder="votre@email.fr"
              required
              style="
                flex:1;min-width:160px;
                border:1px solid #e7e5e4;
                border-radius:0.75rem;
                padding:0.625rem 1rem;
                font-size:0.875rem;
                font-family:'Inter',sans-serif;
                color:#1c1917;
                background:#fff;
                outline:none;
              "
            >
            <button id="ei-btn" type="submit" style="
              background:#92400e;color:white;border:none;
              border-radius:0.75rem;padding:0.625rem 1.25rem;
              font-size:0.75rem;font-weight:700;
              text-transform:uppercase;letter-spacing:0.1em;
              cursor:pointer;white-space:nowrap;
              transition:background 0.2s;
            ">S'inscrire</button>
          </div>
          <label style="display:flex;align-items:flex-start;gap:0.5rem;cursor:pointer;">
            <input type="checkbox" id="ei-consent" required style="margin-top:0.2rem;accent-color:#b45309;flex-shrink:0;">
            <span style="font-size:0.7rem;color:#a8a29e;line-height:1.5;">
              J'accepte de recevoir la newsletter filtré. Désabonnement en un clic.
              <a href="/politique-confidentialite.html" style="color:#a8a29e;text-decoration:underline;">Politique de confidentialité</a>.
            </span>
          </label>
        </form>

        <div id="ei-ok" style="display:none;text-align:center;padding:1rem 0;">
          <p style="font-family:'Instrument Serif',serif;font-style:italic;font-size:1.25rem;color:#1c1917;margin-bottom:0.5rem;">Bienvenue.</p>
          <p style="font-size:0.875rem;color:#78716c;font-weight:300;">On se retrouve dans votre boîte mail.</p>
        </div>

        <p style="margin-top:1rem;font-size:0.7rem;color:#d6d3d1;text-align:center;">
          <button onclick="dismissPopup()" style="background:none;border:none;cursor:pointer;color:#d6d3d1;font-size:0.7rem;text-decoration:underline;">Non merci, continuer sans m'inscrire</button>
        </p>
      </div>
    `;

    document.body.appendChild(overlay);

    // Animate in
    requestAnimationFrame(function () {
      overlay.style.opacity = '1';
      document.getElementById('ei-card').style.transform = 'translateY(0)';
    });

    // Close handlers
    document.getElementById('ei-close').addEventListener('click', dismissPopup);
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) dismissPopup();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') dismissPopup();
    });

    // Form submit
    document.getElementById('ei-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      var btn = document.getElementById('ei-btn');
      var email = document.getElementById('ei-email').value.trim();
      btn.disabled = true;
      btn.textContent = '…';
      try {
        var res = await fetch('/api/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email, source: 'exit-intent' })
        });
        if (!res.ok) throw new Error();
        document.getElementById('ei-form').style.display = 'none';
        document.getElementById('ei-ok').style.display = 'block';
        sessionStorage.setItem(STORAGE_KEY, '1');
        if (typeof equateur === 'function') {
          equateur('track', 'NewsletterSignup', { source: 'exit-intent', page: window.location.pathname });
        }
        setTimeout(dismissPopup, 3000);
      } catch {
        btn.disabled = false;
        btn.textContent = "S'inscrire";
      }
    });
  }

  function dismissPopup() {
    var overlay = document.getElementById('ei-overlay');
    if (!overlay) return;
    overlay.style.opacity = '0';
    setTimeout(function () { overlay.remove(); }, 300);
    sessionStorage.setItem(STORAGE_KEY, '1');
  }

  // Expose globally for "non merci" button
  window.dismissPopup = dismissPopup;

  function showPopup() {
    if (shown) return;
    shown = true;
    buildPopup();
  }

  // Desktop : souris qui quitte par le haut
  document.addEventListener('mouseleave', function (e) {
    if (e.clientY <= 0) showPopup();
  });

  // Mobile : scroll rapide vers le haut (geste "partir")
  var lastScrollY = window.scrollY;
  var scrollTimer;
  window.addEventListener('scroll', function () {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(function () {
      var delta = lastScrollY - window.scrollY;
      // Scroll up rapide de plus de 300px depuis au moins 30% de la page
      if (delta > 300 && window.scrollY > document.documentElement.scrollHeight * 0.3) {
        showPopup();
      }
      lastScrollY = window.scrollY;
    }, 150);
    lastScrollY = window.scrollY;
  }, { passive: true });

})();
