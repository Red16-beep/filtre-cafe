// filtré. — Affiliate + Catalogue click tracking via Équateur

document.addEventListener('DOMContentLoaded', function () {

  // ── Liens affiliés Amazon (articles) ──────────────────────────────────────
  // Statiques dans le HTML → listeners directs OK
  document.querySelectorAll('a[rel*="sponsored"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof equateur !== 'function') return;
      equateur('track', 'AffiliateClick', {
        product: (this.textContent || '').trim().substring(0, 60),
        page: window.location.pathname,
        destination: (this.href || '').substring(0, 120)
      });
    });
  });

  // ── Liens internes de funnel (journal → pages money) ─────────────────────
  document.querySelectorAll('a[data-funnel-link]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof equateur !== 'function') return;
      equateur('track', 'FunnelClick', {
        slot: this.dataset.funnelLink || 'unknown',
        label: (this.textContent || '').trim().substring(0, 80),
        page: window.location.pathname,
        destination: (this.href || '').substring(0, 120)
      });
    });
  });

});

// ── Liens catalogue torréfacteurs (event delegation) ──────────────────────
// Les cartes sont rendues dynamiquement → on écoute sur document
document.addEventListener('click', function (e) {
  var link = e.target.closest('a[data-coffee-name]');
  if (!link) return;
  if (typeof equateur !== 'function') return;
  equateur('track', 'CatalogueClick', {
    coffee: link.dataset.coffeeName || 'inconnu',
    destination: (link.href || '').substring(0, 120)
  });
});
