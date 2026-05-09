// filtre. — funnel and outbound tracking via Equateur

(function () {
  var scrollMarks = [25, 50, 75, 90];
  var sentScrollMarks = {};

  function cleanText(value, limit) {
    return (value || '').replace(/\s+/g, ' ').trim().substring(0, limit || 100);
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
    var destinationType = getDestinationType(link.href);
    if (destinationType === 'internal' || destinationType === 'unknown') return;

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

  window.addEventListener('scroll', function () {
    var doc = document.documentElement;
    var total = doc.scrollHeight - window.innerHeight;
    if (total <= 0) return;

    var current = Math.round((window.scrollY / total) * 100);
    scrollMarks.forEach(function (mark) {
      if (current >= mark && !sentScrollMarks[mark]) {
        sentScrollMarks[mark] = true;
        track('ArticleScrollDepth', { percent: mark });
      }
    });
  }, { passive: true });
})();
