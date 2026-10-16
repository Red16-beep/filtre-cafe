/* filtré. v2 : interactions et schémas animés (version test). Aucune dépendance. */
(function () {
  'use strict';
  var preference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduit = preference.matches;
  var auChangement = function (e) {
    reduit = e.matches;
    if (reduit) $$('.v2-entree,.v2-scene.joue,.v2-anim.joue').forEach(function (el) { el.classList.remove('v2-entree', 'joue'); });
  };
  /* anciens Safari : addListener seulement */
  if (preference.addEventListener) preference.addEventListener('change', auChangement); else if (preference.addListener) preference.addListener(auChangement);
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ── En-tête : méga-menus au clic (tactile) et tiroir mobile ── */
  $$('.v2-nav__item > button.v2-nav__lien').forEach(function (b) {
    b.addEventListener('click', function (e) {
      e.stopPropagation();
      var it = b.parentNode, etait = it.classList.contains('ouvert');
      $$('.v2-nav__item.ouvert').forEach(function (x) { x.classList.remove('ouvert'); x.firstElementChild.setAttribute('aria-expanded', 'false'); });
      if (!etait) { it.classList.add('ouvert'); b.setAttribute('aria-expanded', 'true'); }
    });
  });
  document.addEventListener('click', function (e) {
    if (!e.target.closest('.v2-nav__item')) $$('.v2-nav__item.ouvert').forEach(function (x) { x.classList.remove('ouvert'); });
  });
  var tiroir = $('#v2-tiroir');
  function tiroirOuvrir() { if (!tiroir) return; tiroir.classList.add('ouvert'); document.body.style.overflow = 'hidden'; }
  function tiroirFermer() { if (!tiroir) return; tiroir.classList.remove('ouvert'); document.body.style.overflow = ''; }
  $$('[data-v2-tiroir]').forEach(function (b) { b.addEventListener('click', tiroirOuvrir); });
  $$('[data-v2-fermer]').forEach(function (b) { b.addEventListener('click', tiroirFermer); });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { tiroirFermer(); $$('.v2-nav__item.ouvert').forEach(function (x) { x.classList.remove('ouvert'); }); }
  });

  /* ── Héros : un versement, puis lecture libre des scènes ── */
  var scenes = $$('.v2-scene'), hero = $('.v2-hero__scenes');
  if (scenes.length) {
    var i = 0, visible = false;
    var num = $('#v2-legende-num'), titre = $('#v2-legende-titre'), sous = $('#v2-legende-sous'), barre = $('#v2-legende-barre');
    function montrer(n) {
      scenes[i].classList.remove('actif', 'joue');
      i = (n + scenes.length) % scenes.length;
      var s = scenes[i]; s.classList.add('actif');
      scenes.forEach(function (sc, k) { sc.setAttribute('aria-hidden', k === i ? 'false' : 'true'); });
      if (num) num.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(scenes.length).padStart(2, '0');
      if (titre) titre.textContent = s.dataset.titre || '';
      if (sous) sous.innerHTML = s.dataset.sous || '';
      if (barre) barre.style.transform = 'scaleX(' + ((i + 1) / scenes.length) + ')';
      requestAnimationFrame(function () { if (!reduit && visible && scenes[i] === s) s.classList.add('joue'); });
    }
    var prec = $('#v2-legende-prec'), suiv = $('#v2-legende-suiv');
    if (prec) prec.addEventListener('click', function () { montrer(i - 1); });
    if (suiv) suiv.addEventListener('click', function () { montrer(i + 1); });
    if (hero && 'IntersectionObserver' in window) {
      var vue = new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        hero.classList.toggle('en-vue', visible);
        if (visible && !reduit) scenes[i].classList.add('joue');
      }, { threshold: .2 });
      vue.observe(hero);
    }
    document.addEventListener('visibilitychange', function () { if (hero) hero.classList.toggle('en-vue', visible && !document.hidden); });
    montrer(0);
  }

  /* ── Entrées : contenu toujours visible, une seule respiration au défilement ── */
  if ('IntersectionObserver' in window) {
    var entrees = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        entrees.unobserve(e.target);
        if (!reduit) e.target.classList.add('v2-entree');
      });
    }, { threshold: .12 });
    $$('.v2-tete,.v2-carte,.v2-envie,.v2-pratique').forEach(function (el) { entrees.observe(el); });
  }

  /* ── Rail des incontournables ── */
  $$('[data-v2-rail]').forEach(function (bloc) {
    var rail = $('.v2-rail', bloc), progres = $('.v2-rail__progres i', bloc);
    if (!rail) return;
    function maj() {
      var max = rail.scrollWidth - rail.clientWidth;
      var part = rail.clientWidth / rail.scrollWidth;
      if (progres) progres.style.transform = 'translateX(' + (max > 0 ? (rail.scrollLeft / max) * (1 - part) * 100 : 0) + '%) scaleX(' + part + ')';
    }
    var attenteRail = false;
    function programmer() { if (attenteRail) return; attenteRail = true; requestAnimationFrame(function () { attenteRail = false; maj(); }); }
    rail.addEventListener('scroll', programmer, { passive: true }); window.addEventListener('resize', programmer); maj();
    var pas = function () { var c = $('.v2-carte', rail); return c ? c.getBoundingClientRect().width + 18 : 320; };
    var p = $('[data-v2-prec]', bloc), s = $('[data-v2-suiv]', bloc);
    if (p) p.addEventListener('click', function () { rail.scrollBy({ left: -pas(), behavior: reduit ? 'auto' : 'smooth' }); });
    if (s) s.addEventListener('click', function () { rail.scrollBy({ left: pas(), behavior: reduit ? 'auto' : 'smooth' }); });
  });

  /* ── Carte des origines : survol de la liste ── */
  $$('[data-origine]').forEach(function (lien) {
    var id = lien.getAttribute('data-origine');
    function on() { var d = document.getElementById('point-' + id); if (d) d.classList.add('allume'); }
    function off() { var d = document.getElementById('point-' + id); if (d) d.classList.remove('allume'); }
    lien.addEventListener('mouseenter', on); lien.addEventListener('mouseleave', off);
    lien.addEventListener('focus', on); lien.addEventListener('blur', off);
  });

  /* ── Schémas animés ── */
  function fig(cle, titre, etiquette, svg, legende) {
    return '<figure class="v2-schema" data-cle="' + cle + '"><div class="v2-schema__tete"><div><span>' + etiquette + '</span><h3>' + titre + '</h3></div>' +
      '<button type="button" class="rejouer">Rejouer l’animation</button></div><div class="v2-anim">' + svg + '</div>' +
      (legende ? '<figcaption>' + legende + '</figcaption>' : '') + '</figure>';
  }
  var C = { crema: '#efc79c', cerise: '#e0673f', feuille: '#8fb08f', cuivre: '#c98a5c', texte: '#f4ece3', doux: 'rgba(244,236,227,.55)', filet: 'rgba(244,236,227,.18)' };

  var SCHEMAS = {
    extraction: function () {
      var w = 720, h = 300, x0 = 50, x1 = 690, y0 = 240, y1 = 40;
      var courbe = function (debut, pente) { var d = ''; for (var k = 0; k <= 40; k++) { var t = k / 40, x = x0 + (x1 - x0) * t, v = 1 / (1 + Math.exp(-(t - debut) * pente)); d += (k ? 'L' : 'M') + x.toFixed(1) + ' ' + (y0 - (y0 - y1) * v * 0.92).toFixed(1); } return d; };
      var zones = '<rect x="' + x0 + '" y="' + y1 + '" width="200" height="' + (y0 - y1) + '" fill="rgba(143,176,143,.10)"/>' +
        '<rect x="250" y="' + y1 + '" width="230" height="' + (y0 - y1) + '" fill="rgba(239,199,156,.12)"/>' +
        '<rect x="480" y="' + y1 + '" width="210" height="' + (y0 - y1) + '" fill="rgba(224,103,63,.12)"/>';
      var axes = '<line x1="' + x0 + '" y1="' + y0 + '" x2="' + x1 + '" y2="' + y0 + '" stroke="' + C.filet + '"/>' +
        '<text x="' + x0 + '" y="' + (y0 + 26) + '" fill="' + C.doux + '" font-size="12">Plus court, plus grossier</text>' +
        '<text x="' + x1 + '" y="' + (y0 + 26) + '" fill="' + C.doux + '" font-size="12" text-anchor="end">Plus long, plus fin</text>';
      var labels = '<text x="150" y="64" fill="' + C.feuille + '" font-size="13" font-weight="600" text-anchor="middle">SOUS-EXTRAIT</text><text x="150" y="82" fill="' + C.doux + '" font-size="12" text-anchor="middle">acide, salé, maigre</text>' +
        '<text x="365" y="64" fill="' + C.crema + '" font-size="13" font-weight="600" text-anchor="middle">ÉQUILIBRÉ</text><text x="365" y="82" fill="' + C.doux + '" font-size="12" text-anchor="middle">sucré, rond, long</text>' +
        '<text x="585" y="64" fill="' + C.cerise + '" font-size="13" font-weight="600" text-anchor="middle">SUR-EXTRAIT</text><text x="585" y="82" fill="' + C.doux + '" font-size="12" text-anchor="middle">amer, sec, astringent</text>';
      var c1 = '<path class="trace" style="--l:900" d="' + courbe(0.12, 14) + '" fill="none" stroke="' + C.feuille + '" stroke-width="3"/>';
      var c2 = '<path class="trace" style="--l:900;animation-delay:.5s" d="' + courbe(0.45, 12) + '" fill="none" stroke="' + C.crema + '" stroke-width="3"/>';
      var c3 = '<path class="trace" style="--l:900;animation-delay:1s" d="' + courbe(0.78, 12) + '" fill="none" stroke="' + C.cerise + '" stroke-width="3"/>';
      var leg = '<g font-size="12.5"><circle cx="60" cy="282" r="5" fill="' + C.feuille + '"/><text x="72" y="286" fill="' + C.texte + '">acides</text><circle cx="140" cy="282" r="5" fill="' + C.crema + '"/><text x="152" y="286" fill="' + C.texte + '">sucres</text><circle cx="222" cy="282" r="5" fill="' + C.cerise + '"/><text x="234" y="286" fill="' + C.texte + '">composés amers</text></g>';
      var curseur = '<g style="animation:v2-balaye 2.2s .8s ease-in-out forwards;--d:600px"><line x1="' + (x0 + 20) + '" y1="' + (y1 + 52) + '" x2="' + (x0 + 20) + '" y2="' + y0 + '" stroke="' + C.texte + '" stroke-dasharray="3 5"/><circle cx="' + (x0 + 20) + '" cy="' + y0 + '" r="6" fill="' + C.texte + '"/></g>';
      return fig('extraction', 'Ce que le temps fait au goût', 'Extraction', '<svg viewBox="0 0 ' + w + ' 300" role="img" aria-label="Courbes d’extraction : acides, puis sucres, puis composés amers">' + zones + axes + labels + c1 + c2 + c3 + curseur + leg + '</svg>',
        'Les acides s’extraient en premier, les sucres ensuite, les composés amers en dernier. Un café trop court est acide, un café trop long est amer. Voir <a href="/journal/pourquoi-cafe-acide">café acide</a> et <a href="/journal/pourquoi-cafe-amer">café amer</a>.');
    },
    v60: function () {
      var etapes = [
        { a: 0, b: 30, g: 30, n: 'Bloom' }, { a: 30, b: 60, g: 150, n: '1er versement' }, { a: 60, b: 90, g: 200, n: '2e versement' },
        { a: 90, b: 120, g: 250, n: 'Versement final' }, { a: 120, b: 195, g: 250, n: 'Écoulement' }];
      var x0 = 40, x1 = 680, t1 = 210, sx = function (s) { return x0 + (x1 - x0) * s / t1; };
      var barres = etapes.map(function (e, k) {
        var x = sx(e.a), wd = sx(e.b) - sx(e.a), hh = e.g / 250 * 150, y = 200 - hh;
        return '<g class="apparait" style="animation-delay:' + (0.4 + k * 0.5) + 's"><rect class="pousse" style="animation-delay:' + (0.4 + k * 0.5) + 's" x="' + (x + 2) + '" y="' + y + '" width="' + (wd - 4) + '" height="' + hh + '" rx="6" fill="' + (k === 4 ? 'rgba(239,199,156,.22)' : (k === 0 ? C.feuille : C.crema)) + '"/>' +
          '<text x="' + (x + wd / 2) + '" y="' + (y - 10) + '" fill="' + C.texte + '" font-size="13" font-weight="600" text-anchor="middle">' + (k === 4 ? '' : e.g + ' g') + '</text>' +
          '<text x="' + (x + wd / 2) + '" y="226" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">' + e.n + '</text></g>';
      }).join('');
      var ticks = [0, 30, 60, 90, 120, 150, 180, 210].map(function (s) { return '<text x="' + sx(s) + '" y="250" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') + '</text>'; }).join('');
      var fin = '<rect x="' + sx(150) + '" y="236" width="' + (sx(210) - sx(150)) + '" height="4" rx="2" fill="' + C.cerise + '"/><text x="' + sx(180) + '" y="272" fill="' + C.cerise + '" font-size="11.5" text-anchor="middle" font-weight="600">fin entre 2:30 et 3:30</text>';
      var tete = '<g style="animation:v2-balaye 2.8s 1.4s linear forwards;--d:' + (x1 - x0) + 'px"><line x1="' + x0 + '" y1="40" x2="' + x0 + '" y2="236" stroke="' + C.texte + '" stroke-width="1.5"/><circle cx="' + x0 + '" cy="40" r="4" fill="' + C.texte + '"/></g>';
      return fig('v60', 'La recette V60, seconde par seconde', 'V60 · 15 g · 250 g · 93 °C', '<svg viewBox="0 0 720 280" role="img" aria-label="Chronologie de la recette V60">' + '<line x1="' + x0 + '" y1="236" x2="' + x1 + '" y2="236" stroke="' + C.filet + '"/>' + barres + ticks + fin + tete + '</svg>',
        'Bloom de 30 g pendant 30 secondes, puis 150 g, 200 g et 250 g en trois versements en spirale. Le débit s’arrête vers 2:30 à 3:30 : plus long, desserrez la mouture. Recette complète dans le <a href="/journal/v60-guide-complet">guide V60</a>.');
    },
    mouture: function () {
      var m = [
        { n: 'Espresso', d: 'fine', r: 2.2, lien: '/journal/comment-faire-espresso-parfait' },
        { n: 'V60', d: 'médium-fine, sucre semoule', r: 3.4, lien: '/journal/v60-guide-complet' },
        { n: 'Moka', d: 'médium', r: 4.2, lien: '/journal/moka-pot-guide-complet' },
        { n: 'Piston', d: 'grossière', r: 5.6, lien: '/journal/french-press-guide' },
        { n: 'Cold brew', d: 'très grossière, sucre gros', r: 7, lien: '/journal/cold-brew-maison' }];
      var out = m.map(function (e, k) {
        var cx = 75 + k * 142, pts = '';
        for (var j = 0; j < 14; j++) {
          var a = (j * 137.5) * Math.PI / 180, rr = 6 + 26 * Math.sqrt(j / 14), x = cx + rr * Math.cos(a), y = 110 + rr * Math.sin(a) * 0.9;
          pts += '<circle class="tombe" style="animation-delay:' + (k * 0.25 + j * 0.03).toFixed(2) + 's" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + e.r + '" fill="' + C.cuivre + '"/>';
        }
        return '<g>' + pts + '<text x="' + cx + '" y="186" fill="' + C.texte + '" font-size="15" font-weight="600" text-anchor="middle">' + e.n + '</text><text x="' + cx + '" y="206" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">' + e.d + '</text></g>';
      }).join('');
      var fl = '<line x1="40" y1="236" x2="690" y2="236" stroke="' + C.filet + '"/><path d="M684 231 L692 236 L684 241" fill="none" stroke="' + C.doux + '"/><text x="40" y="258" fill="' + C.doux + '" font-size="11.5">plus fin, extraction rapide</text><text x="690" y="258" fill="' + C.doux + '" font-size="11.5" text-anchor="end">plus grossier, contact long</text>';
      return fig('mouture', 'La mouture, méthode par méthode', 'Mouture', '<svg viewBox="0 0 720 270" role="img" aria-label="Taille de mouture par méthode, de l’espresso au cold brew">' + out + fl + '</svg>',
        'Plus le contact entre l’eau et le café est court, plus la mouture est fine. Repères tirés des guides <a href="/journal/v60-guide-complet">V60</a>, <a href="/journal/moka-pot-guide-complet">moka</a>, <a href="/journal/french-press-guide">piston</a> et <a href="/journal/cold-brew-maison">cold brew</a>.');
    },
    eau: function () {
      var eaux = [
        { n: 'Mont Blanc', v: 134, r: '1re ex æquo', c: C.crema }, { n: 'Volvic', v: 130, r: '1re ex æquo', c: C.crema },
        { n: 'Rocheval', v: 240, r: '3e', c: C.cuivre }, { n: 'Cristaline (Louise)', v: 477, r: '5e', c: C.cerise },
        { n: 'Mont Roucous', v: 33, r: 'non goûtée', c: 'rgba(244,236,227,.35)' }];
      var x0 = 170, x1 = 690, sx = function (v) { return x0 + (x1 - x0) * v / 500; };
      var bandes = '<rect x="' + sx(75) + '" y="20" width="' + (sx(250) - sx(75)) + '" height="232" fill="rgba(143,176,143,.10)"/><text x="' + sx(162) + '" y="14" fill="' + C.feuille + '" font-size="11.5" font-weight="600" text-anchor="middle">SCAA : 75 à 250</text>' +
        '<line x1="' + sx(150) + '" y1="20" x2="' + sx(150) + '" y2="252" stroke="' + C.feuille + '" stroke-dasharray="4 5"/>';
      var barres = eaux.map(function (e, k) {
        var y = 34 + k * 44;
        return '<text x="' + (x0 - 12) + '" y="' + (y + 15) + '" fill="' + C.texte + '" font-size="13.5" text-anchor="end">' + e.n + '</text>' +
          '<rect class="pousse-x" style="animation-delay:' + (0.3 + k * 0.25) + 's" x="' + x0 + '" y="' + y + '" width="' + (sx(e.v) - x0) + '" height="22" rx="5" fill="' + e.c + '"/>' +
          '<text class="apparait" style="animation-delay:' + (1.2 + k * 0.25) + 's" x="' + (sx(e.v) + 8) + '" y="' + (y + 15) + '" fill="' + C.texte + '" font-size="12.5" font-weight="600">' + e.v + ' mg/L · ' + e.r + '</text>';
      }).join('');
      var axe = [0, 100, 200, 300, 400, 500].map(function (v) { return '<text x="' + sx(v) + '" y="270" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + v + '</text>'; }).join('');
      return fig('eau', 'Mon test à l’aveugle, en résidu sec', 'Eau · 6 eaux · 1 café', '<svg viewBox="0 0 720 280" role="img" aria-label="Résidu sec des eaux testées face à la plage SCAA">' + bandes + barres + axe + '</svg>',
        'Résidu sec des étiquettes (mg/L) face à la plage SCAA de 2009 (75 à 250, cible 150). Le Brita avec magnésium (4e) et l’eau du robinet (6e) n’ont pas de chiffre publié. Détails et protocole dans le <a href="/journal/eau-cafe-filtre-tds-mineraux">test des eaux</a>.');
    },
    degazage: function () {
      var x0 = 40, x1 = 690, sx = function (j) { return x0 + (x1 - x0) * j / 49; };
      var zones = '<rect class="pousse-x" x="' + sx(7) + '" y="70" width="' + (sx(14) - sx(7)) + '" height="34" rx="6" fill="' + C.crema + '"/><text x="' + sx(10.5) + '" y="62" fill="' + C.crema + '" font-size="12" font-weight="600" text-anchor="middle">Filtre : 7 à 14 j de repos</text>' +
        '<rect class="pousse-x" style="animation-delay:.4s" x="' + sx(10) + '" y="130" width="' + (sx(21) - sx(10)) + '" height="34" rx="6" fill="' + C.cuivre + '"/><text x="' + sx(15.5) + '" y="122" fill="' + C.cuivre + '" font-size="12" font-weight="600" text-anchor="middle">Espresso : 10 à 21 j</text>' +
        '<rect class="pousse-x" style="animation-delay:.8s" x="' + sx(42) + '" y="186" width="' + (sx(49) - sx(42)) + '" height="20" rx="6" fill="rgba(224,103,63,.55)"/><text x="' + sx(45.5) + '" y="180" fill="' + C.cerise + '" font-size="12" font-weight="600" text-anchor="middle">les arômes fins s’estompent</text>';
      var ticks = [0, 7, 14, 21, 28, 35, 42, 49].map(function (j) { return '<line x1="' + sx(j) + '" y1="216" x2="' + sx(j) + '" y2="222" stroke="' + C.doux + '"/><text x="' + sx(j) + '" y="238" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + (j === 0 ? 'torréfaction' : 'J+' + j) + '</text>'; }).join('');
      var bulles = '';
      for (var b = 0; b < 16; b++) { var x = sx(1 + (b % 8) * 1.4), dl = (b * 0.37) % 3; bulles += '<circle cx="' + x.toFixed(1) + '" cy="200" r="' + (2 + (b % 3)) + '" fill="none" stroke="' + C.texte + '" stroke-opacity=".6" style="animation:v2-bulle 2.6s ' + dl.toFixed(2) + 's ease-out forwards"/>'; }
      return fig('degazage', 'Quand boire son café après torréfaction', 'Dégazage', '<svg viewBox="0 0 720 250" role="img" aria-label="Fenêtres de repos après torréfaction">' + '<line x1="' + x0 + '" y1="216" x2="' + x1 + '" y2="216" stroke="' + C.filet + '"/>' + zones + bulles + ticks + '<text x="' + sx(2.5) + '" y="150" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">CO₂</text></svg>',
        'Le grain relâche du CO₂ pendant des jours après la torréfaction. Repères du <a href="/journal/degazage-cafe">guide du dégazage</a> ; au-delà de six semaines, les arômes les plus fins s’estompent (<a href="/journal/meilleur-cafe-en-grain-2025">café en grain</a>).');
    },
    espresso: function () {
      var x0 = 60, x1 = 680, sx = function (s) { return x0 + (x1 - x0) * s / 45; };
      var zones = '<rect x="' + sx(0) + '" y="90" width="' + (sx(22) - sx(0)) + '" height="40" fill="rgba(143,176,143,.18)"/><rect x="' + sx(25) + '" y="90" width="' + (sx(30) - sx(25)) + '" height="40" fill="rgba(239,199,156,.45)"/><rect x="' + sx(35) + '" y="90" width="' + (sx(45) - sx(35)) + '" height="40" fill="rgba(224,103,63,.25)"/>' +
        '<text x="' + sx(11) + '" y="82" fill="' + C.feuille + '" font-size="12" font-weight="600" text-anchor="middle">trop rapide : acide, maigre</text>' +
        '<text x="' + sx(27.5) + '" y="82" fill="' + C.crema + '" font-size="12" font-weight="600" text-anchor="middle">repère 25 à 30 s</text>' +
        '<text x="' + sx(40) + '" y="82" fill="' + C.cerise + '" font-size="12" font-weight="600" text-anchor="middle">trop lent : amer, astringent</text>';
      var ticks = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45].map(function (s) { return '<text x="' + sx(s) + '" y="152" fill="' + C.doux + '" font-size="11" text-anchor="middle">' + s + ' s</text>'; }).join('');
      var reel = '<rect x="' + sx(22) + '" y="166" width="' + (sx(40) - sx(22)) + '" height="6" rx="3" fill="' + C.doux + '"/><text x="' + sx(31) + '" y="190" fill="' + C.doux + '" font-size="11.5" text-anchor="middle">en coffee shop : de 22 à 40 s</text>';
      var aiguille = '<g style="animation:v2-balaye 2s .8s cubic-bezier(.3,.1,.3,1) forwards;--d:' + (sx(26) - x0) + 'px"><line x1="' + x0 + '" y1="84" x2="' + x0 + '" y2="136" stroke="' + C.texte + '" stroke-width="2.5"/><circle cx="' + x0 + '" cy="84" r="5" fill="' + C.texte + '"/></g>';
      var tasse = '<g transform="translate(560 200)"><text x="0" y="40" fill="' + C.texte + '" font-size="13" font-weight="600" text-anchor="middle">18 g → 36 g</text></g><text x="' + x0 + '" y="240" fill="' + C.texte + '" font-size="13" font-weight="600">Mon protocole : environ 26 s, 92 à 94 °C</text>';
      return fig('espresso', 'Lire le temps d’un espresso', 'Espresso · 1:2', '<svg viewBox="0 0 720 255" role="img" aria-label="Temps d’extraction de l’espresso et goût">' + zones + ticks + reel + aiguille + tasse + '</svg>',
        'Le repère : 18 g de café pour 36 g en tasse, en 25 à 30 secondes. Plus rapide, le shot est acide et sous-extrait ; plus lent, sur-extrait et astringent. Diagnostic complet : <a href="/journal/espresso-trop-rapide-trop-lent-diagnostic">espresso trop rapide ou trop lent</a>.');
    }
  };

  function demarrerSchemas(racine) {
    var cibles = $$('[data-schema]', racine || document);
    if (!cibles.length) return;
    cibles.forEach(function (el) {
      var f = SCHEMAS[el.getAttribute('data-schema')];
      if (!f || el.dataset.rendu) return;
      el.innerHTML = f(); el.dataset.rendu = '1';
      /* pas de lien vers la page où l'on se trouve déjà */
      $$('a[href]', el).forEach(function (a) {
        if (a.getAttribute('href').replace(/\.html$/, '') === location.pathname.replace(/\.html$/, '')) a.replaceWith(document.createTextNode(a.textContent));
      });
      var anim = $('.v2-anim', el), bouton = $('.rejouer', el);
      if (bouton) bouton.addEventListener('click', function () {
        if (reduit) return;
        var neuf = anim.cloneNode(true); neuf.classList.remove('joue'); anim.parentNode.replaceChild(neuf, anim); anim = neuf;
        requestAnimationFrame(function () { anim.classList.add('joue'); });
      });
      if (!('IntersectionObserver' in window)) return;
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { anim.classList.toggle('en-vue', e.isIntersecting); if (e.isIntersecting && !reduit) anim.classList.add('joue'); }); }, { threshold: 0.35 });
      io.observe(el);
    });
  }

  /* ── Pages article : schéma au bon endroit et sommaire latéral ── */
  var CARTE = {
    '/journal/v60-guide-complet': ['v60', /recette de base|protocole/i],
    '/journal/eau-cafe-filtre-tds-mineraux': ['eau', /ce que disent les chiffres/i],
    '/journal/degazage-cafe': ['degazage', null],
    '/journal/espresso-trop-rapide-trop-lent-diagnostic': ['espresso', null],
    '/journal/comment-faire-espresso-parfait': ['espresso', null],
    '/journal/pourquoi-cafe-amer': ['extraction', null],
    '/journal/pourquoi-cafe-acide': ['extraction', null],
    '/journal/ratio-cafe-eau-extraction': ['extraction', /ajuster|goût/i],
    '/journal/meilleur-moulin-cafe-electrique': ['mouture', null],
    '/journal/meilleur-moulin-cafe-manuel': ['mouture', null],
    '/journal/mouture-cafe-v60': ['mouture', null]
  };
  var chemin = location.pathname.replace(/\.html$/, '').replace(/\/$/, '');
  var article = $('main article') || $('article');
  if (article && CARTE[chemin]) {
    var cfg = CARTE[chemin], h2s = $$('h2', article), cible = null;
    if (cfg[1]) cible = h2s.filter(function (h) { return cfg[1].test(h.textContent); })[0];
    if (!cible) cible = h2s[0];
    if (cible) {
      var bloc = document.createElement('div'); bloc.setAttribute('data-schema', cfg[0]);
      var apres = cible.nextElementSibling || cible;
      apres.parentNode.insertBefore(bloc, apres.nextSibling);
    }
  }
  demarrerSchemas();

  if (article) {
    var titres = $$('h2', article).filter(function (h) { return !h.closest('details, .top-item, .v2-schema') && h.textContent.trim().length > 2; });
    if (titres.length >= 3) {
      var nav = document.createElement('nav'); nav.className = 'v2-sommaire'; nav.setAttribute('aria-label', 'Au sommaire');
      var html = '<p>Au sommaire</p><ol>';
      titres.forEach(function (h, k) {
        if (!h.id) h.id = 'section-' + (k + 1);
        html += '<li><a href="#' + h.id + '"><span>' + String(k + 1).padStart(2, '0') + '</span>' + h.textContent.trim().replace(/^\d+\s*/, '') + '</a></li>';
      });
      nav.innerHTML = html + '</ol>'; document.body.appendChild(nav); nav.classList.add('pret');
      /* le sommaire s'efface dès que la fin de l'article remonte à sa hauteur :
         il ne recouvre ni l'encadré auteur, ni les blocs de fin, ni le pied de page */
      var attente = false;
      var placer = function () {
        attente = false;
        var fin = article.getBoundingClientRect().bottom;
        nav.classList.toggle('cache', fin < nav.getBoundingClientRect().top + nav.offsetHeight + 24);
      };
      window.addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(placer); } }, { passive: true });
      window.addEventListener('resize', placer);
      placer();
      var liens = $$('a', nav);
      if ('IntersectionObserver' in window) {
        var io2 = new IntersectionObserver(function (es) {
          es.forEach(function (e) { if (e.isIntersecting) { liens.forEach(function (l) { l.classList.toggle('actif', l.getAttribute('href') === '#' + e.target.id); }); } });
        }, { rootMargin: '-20% 0px -70% 0px' });
        titres.forEach(function (h) { io2.observe(h); });
      }
    }
  }

  /* ── 404 : régler le moulin, tirer le shot ──
     Temps pour 36 g selon la mouture (1 très fin, 20 très gros) : 4,04 s à 20, 27 s vers 8,
     plus de 45 s en dessous de 5 : ça ne coule plus. Un shot entre 25 et 30 s ouvre une vraie page. */
  var tirer = document.getElementById('v2-tirer');
  if (tirer) {
    var el = function (id) { return document.getElementById(id); };
    var curseur = el('v2-mouture'), valeur = el('v2-mouture-val'), poids = el('v2-poids'), chrono = el('v2-chrono'),
        liquide = el('v2-liquide'), aiguille = el('v2-aiguille'), voyant = el('v2-voyant'), filets = $$('.v2-err__filet'),
        fiche = el('v2-fiche'), verdict = el('v2-verdict'), tampon = el('v2-tampon');
    var PAGES = [
      ['/journal/espresso-trop-rapide-trop-lent-diagnostic', 'Espresso trop rapide ou trop lent : le diagnostic'],
      ['/journal/comment-faire-espresso-parfait', 'Comment faire un espresso, recette et réglages'],
      ['/journal/v60-guide-complet', 'Le guide V60, dose et recette'],
      ['/journal/eau-cafe-filtre-tds-mineraux', 'Six eaux goûtées à l’aveugle'],
      ['/journal/ratio-cafe-eau-extraction', 'Le ratio café/eau, méthode par méthode'],
      ['/journal/methode-4-6-kasuya', 'La méthode 4:6 de Tetsu Kasuya']
    ];
    var enCours = false;
    var fr = function (n, d) { return n.toFixed(d).replace('.', ','); };
    poids.classList.add('clignote');
    curseur.addEventListener('input', function () { valeur.textContent = curseur.value; });

    var afficher = function (s, w, bar, debit, coule) {
      chrono.textContent = fr(s, 1);
      poids.textContent = fr(w, 1);
      liquide.style.transform = 'scaleY(' + Math.min(1, w / 40).toFixed(3) + ')';
      aiguille.style.transform = 'rotate(' + (-120 + bar / 12 * 240).toFixed(1) + 'deg)';
      filets.forEach(function (f) {
        f.classList.toggle('coule', coule);
        f.style.transform = 'scaleX(' + Math.max(.24, Math.min(1, .2 + debit * .18)).toFixed(3) + ')';
      });
    };

    var conclure = function (g, t, bouche, w) {
      enCours = false; tirer.disabled = false;
      tirer.firstChild.nodeValue = 'Retirer un shot ';
      voyant.setAttribute('fill', '#4b6b4f');
      el('v2-f-mouture').textContent = g + ' / 20';
      var dec = !bouche && t < 10 ? 2 : 1;
      chrono.textContent = fr(bouche ? 45 : t, dec);
      el('v2-f-temps').textContent = fr(bouche ? 45 : t, dec) + ' s';
      el('v2-f-poids').textContent = fr(w, 1) + ' g';
      var texte, cachet, reussi = false, lien = null;
      if (g === 20) { texte = '4,04 secondes. Évidemment. Mouture beaucoup trop grosse : l’eau traverse sans rien extraire, comme vous à travers cette page. Moulez plus fin.'; cachet = 'Sous-extrait'; }
      else if (bouche) { texte = 'Ça ne coule plus. Moulu trop fin, la galette bloque l’eau : la page s’est bouchée. Notes de dégustation : clope froide. Un cran plus gros.'; cachet = 'Bouché'; }
      else if (t < 15) { texte = fr(t, 1) + ' s pour 36 g : beaucoup trop rapide. Sous-extrait, acide, creux. Plus fin.'; cachet = 'Sous-extrait'; }
      else if (t < 25) { texte = fr(t, 1) + ' s : encore un peu rapide. Un cran plus fin.'; cachet = 'Presque'; }
      else if (t <= 30) { texte = fr(t, 1) + ' s pour 36 g. Shot réussi. Votre page vous attend : '; cachet = 'Réussi'; reussi = true; lien = PAGES[Math.floor(Math.random() * PAGES.length)]; }
      else { texte = fr(t, 1) + ' s : trop lent. Amer, astringent. Un cran plus gros.'; cachet = 'Sur-extrait'; }
      verdict.textContent = texte;
      if (lien) { var a = document.createElement('a'); a.href = lien[0]; a.textContent = lien[1] + ' →'; verdict.appendChild(a); }
      tampon.textContent = cachet;
      tampon.className = 'v2-err__tampon' + (reussi ? ' reussi' : '');
      fiche.hidden = false;
      requestAnimationFrame(function () { tampon.classList.add('frappe'); });
    };

    tirer.addEventListener('click', function () {
      if (enCours) return;
      enCours = true; tirer.disabled = true;
      var g = +curseur.value;
      var t = g === 20 ? 4.04 : Math.max(3.6, 4.04 * Math.exp(0.158 * (20 - g)) + (Math.random() * 1.2 - 0.6));
      var bouche = t > 45, fin = bouche ? 45 : t;
      var pre = Math.min(4, t * 0.15);
      var wFin = bouche ? 36 * 0.3 * (45 - pre) / (t - pre) : 36;
      var barMax = bouche ? 11 : g >= 16 ? 4 : g >= 12 ? 7 : 9;
      var poidsA = function (s) { var x = (s - pre) / (fin - pre); return x <= 0 ? 0 : wFin * Math.pow(Math.min(1, x), 1.1); };
      poids.classList.remove('clignote'); poids.classList.add('actif');
      voyant.setAttribute('fill', '#e0673f');
      if (reduit) { afficher(fin, wFin, barMax, 0, false); conclure(g, t, bouche, wFin); return; }
      var vitesse = 7, debut = null, avant = 0;
      var image = function (horo) {
        if (debut === null) debut = horo;
        var s = reduit ? fin : Math.min(fin, (horo - debut) / 1000 * vitesse);
        var w = poidsA(s), debit = (w - avant) / Math.max(0.001, (s - (image.s || 0)));
        avant = w; image.s = s;
        afficher(s, w, barMax * Math.min(1, s / 3), debit, s > pre && s < fin);
        if (s < fin) requestAnimationFrame(image);
        else { afficher(fin, wFin, 0, 0, false); conclure(g, t, bouche, wFin); }
      };
      requestAnimationFrame(image);
    });
  }
})();
