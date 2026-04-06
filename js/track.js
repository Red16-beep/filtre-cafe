// filtré. — Affiliate click tracking via Équateur
// Tracks clicks on [rel*="sponsored"] links with product + page context

document.addEventListener('DOMContentLoaded', function () {

  // ── Liens affiliés Amazon (articles) ──────────────────────────────────────
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

  // ── Liens catalogue torréfacteurs ──────────────────────────────────────────
  document.querySelectorAll('a[data-coffee-url], .coffee-card a[href^="http"]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeof equateur !== 'function') return;
      var coffeeName = this.closest('[data-coffee-name]')
        ? this.closest('[data-coffee-name]').dataset.coffeeName
        : (this.dataset.coffeeName || 'inconnu');
      equateur('track', 'CatalogueClick', {
        coffee: coffeeName,
        destination: (this.href || '').substring(0, 120)
      });
    });
  });

});
