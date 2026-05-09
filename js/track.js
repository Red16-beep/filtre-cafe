// filtre. — useful click tracking via Equateur

(function () {
  function cleanText(value, limit) {
    return (value || '').replace(/\s+/g, ' ').trim().substring(0, limit || 100);
  }

  function isLocalEnvironment() {
    var host = window.location.hostname;
    return host === 'localhost' || host === '127.0.0.1' || host === '::1' || host === '';
  }

  function getDestinationType(url) {
    try {
      var parsed = new URL(url, window.location.href);
      var host = parsed.hostname.replace(/^www\./, '');

      if (host === window.location.hostname.replace(/^www\./, '')) return 'internal';
      if (host.indexOf('amazon.') !== -1) return 'amazon';
      if (host === 'anomcafeclub.com') return 'anom';
      if (host === 'tanat.coffee') return 'tanat';
      return 'external';
    } catch (e) {
      return 'unknown';
    }
  }

  function track(eventName, props) {
    if (isLocalEnvironment()) return;

    var payload = props || {};
    payload.page = window.location.pathname;
    payload.page_title = document.title;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: eventName }, payload));

    if (typeof window.equateur === 'function') {
      window.equateur('track', eventName, payload);
    }
  }

  function trackFunnelClick(link) {
    track('FunnelClick', {
      slot: link.dataset.funnelLink || 'unknown',
      label: cleanText(link.textContent, 100),
      destination: (link.href || '').substring(0, 160),
      destination_type: getDestinationType(link.href)
    });
  }

  function trackOutboundClick(link) {
    if (link.dataset.funnelLink) return;

    var destinationType = getDestinationType(link.href);
    if (destinationType === 'internal' || destinationType === 'unknown') return;
    if (destinationType !== 'amazon' && (link.getAttribute('rel') || '').indexOf('sponsored') === -1) return;

    var eventName = destinationType === 'amazon' ? 'AffiliateClick' : 'OutboundClick';
    track(eventName, {
      merchant: destinationType,
      label: cleanText(link.textContent, 100),
      destination: (link.href || '').substring(0, 160),
      sponsored: (link.getAttribute('rel') || '').indexOf('sponsored') !== -1
    });
  }

  document.addEventListener('click', function (e) {
    var funnelLink = e.target.closest('a[data-funnel-link]');
    if (funnelLink) trackFunnelClick(funnelLink);

    var outboundLink = e.target.closest('a[href]');
    if (outboundLink) trackOutboundClick(outboundLink);

    var catalogueLink = e.target.closest('a[data-coffee-name]');
    if (catalogueLink) {
      track('CatalogueClick', {
        coffee: catalogueLink.dataset.coffeeName || 'inconnu',
        destination: (catalogueLink.href || '').substring(0, 160)
      });
    }
  });
})();
